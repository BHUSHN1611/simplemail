const { google } = require('googleapis');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const sanitizeHtml = require('sanitize-html');

// Helper to get and refresh tokens if needed
async function getAuthenticatedClient(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.tokenExpiry
    });
    
    // Check if token needs refresh
    if (user.tokenExpiry && new Date(user.tokenExpiry) <= new Date()) {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update stored tokens
        user.accessToken = credentials.access_token;
        user.tokenExpiry = new Date(credentials.expiry_date);
        await user.save();
        
        oauth2Client.setCredentials(credentials);
    }
    
    return oauth2Client;
}

// Send email
exports.sendEmail = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authClient = await getAuthenticatedClient(decoded._id);
        
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        
        const { to, subject, body} = req.body;
        
        // Create email message
        const message = createMessage({
            from: decoded.email,
            to,
            subject,
            body,
        });
        
        // Send email
        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: message
            }
        });
        
        res.json({
            success: true,
            messageId: result.data.id,
            message: 'Email sent successfully!'
        });
        
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            error: 'Failed to send email',
            details: error.message
        });
    }
};

// Get emails from inbox
exports.getEmails = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authClient = await getAuthenticatedClient(decoded._id);
        
        const gmail = google.gmail({ version: 'v1', auth: authClient });
        
        // Get email list using Gmail API
        try {
            // pagination: allow ?pageToken=xxx or page & limit
            const pageToken = req.query.pageToken;
            const limit = parseInt(req.query.limit, 10) || parseInt(req.query.maxResults, 10) || 20;
            const listOpts = {
                userId: 'me',
                maxResults: limit,
                q: req.query.q || 'in:inbox'
            };
            if (pageToken) listOpts.pageToken = pageToken;

            const response = await gmail.users.messages.list(listOpts);

            if (response.data.messages && response.data.messages.length) {
                // Fetch details for each email
                const emails = await Promise.all(
                    response.data.messages.slice(0, limit).map(async (message) => {
                        const details = await gmail.users.messages.get({
                            userId: 'me',
                            id: message.id
                        });

                        const parsed = parseEmailDetails(details.data);
                        // prefix id to indicate provider
                        parsed.id = `gmail:${parsed.id}`;
                        return parsed;
                    })
                );

                // return nextPageToken for frontend pagination
                return res.json({ emails, nextPageToken: response.data.nextPageToken || null });
            }
            // If Gmail returns no messages, fall through to IMAP below
        } catch (gmailErr) {
            console.warn('Gmail API fetch failed, will try IMAP fallback:', gmailErr.message);
        }

        // IMAP fallback
        const user = await User.findById(decoded._id);
        if (!user || !user.imapHost || !user.imapUser || !user.imapPass) {
            return res.json({ emails: [] });
        }

        const imapConfig = {
            imap: {
                user: user.imapUser,
                password: user.imapPass,
                host: user.imapHost,
                port: user.imapPort || 993,
                tls: user.imapSecure !== undefined ? user.imapSecure : true,
                authTimeout: 3000
            }
        };

        try {
            const connection = await Imap.connect(imapConfig);
            await connection.openBox('INBOX');

            const searchCriteria = ['ALL'];
            const fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'], struct: true };
            const results = await connection.search(searchCriteria, fetchOptions);

            // Parse and map the most recent 20 messages
            const parsed = await Promise.all(results.slice(-20).reverse().map(async (resItem) => {
                const all = resItem.parts.find(part => part.which === 'TEXT') || { body: '' };
                const headerPart = resItem.parts.find(part => part.which && part.which.indexOf('HEADER') === 0);
                const raw = all.body || '';
                const parsedMail = await simpleParser(raw);
                return {
                    id: `imap:${resItem.attributes.uid.toString()}`,
                    from: parsedMail.from?.text || (headerPart && headerPart.body && headerPart.body.from) || '',
                    to: parsedMail.to?.text || '',
                    subject: parsedMail.subject || '',
                    date: parsedMail.date ? parsedMail.date.toString() : '',
                    // sanitize HTML before sending to client
                    body: sanitizeHtml(parsedMail.html || parsedMail.text || '', {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','table','thead','tbody','tr','td','th']),
                        allowedAttributes: {
                            a: ['href', 'name', 'target'],
                            img: ['src', 'alt', 'width', 'height'],
                            '*': ['style']
                        },
                        allowedSchemes: ['http','https','data','cid']
                    }),
                    snippet: parsedMail.text?.slice(0, 200) || '',
                    unread: !resItem.attributes.flags?.includes('Seen')
                };
            }));

            await connection.end();
            return res.json({ emails: parsed });
        } catch (imapErr) {
            console.error('IMAP fetch failed:', imapErr);
            return res.json({ emails: [] });
        }
        
    } catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({
            error: 'Failed to fetch emails',
            details: error.message
        });
    }
};

// Get single email details
exports.getEmailById = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const authClient = await getAuthenticatedClient(decoded._id);
        
        const gmail = google.gmail({ version: 'v1', auth: authClient });

        try {
            // support prefixed ids: allow requests like /message/gmail:12345 or /message/imap:678
            const requestedId = req.params.id;
            if (requestedId.startsWith('gmail:')) {
                const realId = requestedId.replace(/^gmail:/, '');
                const details = await gmail.users.messages.get({ userId: 'me', id: realId });
                const email = parseEmailDetails(details.data);
                email.id = `gmail:${email.id}`;
                // Mark as read
                await gmail.users.messages.modify({ userId: 'me', id: realId, requestBody: { removeLabelIds: ['UNREAD'] } });
                return res.json(email);
            }
            // If no prefix, try as Gmail id first
            try {
                const details = await gmail.users.messages.get({ userId: 'me', id: requestedId });
                const email = parseEmailDetails(details.data);
                email.id = `gmail:${email.id}`;
                await gmail.users.messages.modify({ userId: 'me', id: requestedId, requestBody: { removeLabelIds: ['UNREAD'] } });
                return res.json(email);
            } catch (err) {
                console.warn('Gmail get by raw id failed, will try IMAP fallback');
            }
        } catch (gmailErr) {
            console.warn('Gmail get failed, trying IMAP fallback:', gmailErr.message);
        }

        // IMAP fallback for fetching single message by UID
        const user = await User.findById(decoded._id);
        if (!user || !user.imapHost || !user.imapUser || !user.imapPass) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const imapConfig = {
            imap: {
                user: user.imapUser,
                password: user.imapPass,
                host: user.imapHost,
                port: user.imapPort || 993,
                tls: user.imapSecure !== undefined ? user.imapSecure : true,
                authTimeout: 3000
            }
        };

        try {
            const connection = await Imap.connect(imapConfig);
            await connection.openBox('INBOX');

            //Find by UID
            // strip imap: prefix if present
            const uid = req.params.id.replace(/^imap:/, '');
            const results = await connection.search([['UID', uid]], { bodies: [''] });
            if (!results || !results.length) {
                await connection.end();
                return res.status(404).json({ error: 'Message not found' });
            }

            const raw = results[0].parts.map(p => p.body).join('\n');
            const parsedMail = await simpleParser(raw);

            await connection.end();

            return res.json({
                id: `imap:${uid}`,
                from: parsedMail.from?.text || '',
                to: parsedMail.to?.text || '',
                subject: parsedMail.subject || '',
                date: parsedMail.date ? parsedMail.date.toString() : '',
                body: sanitizeHtml(parsedMail.html || parsedMail.text || '', {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','table','thead','tbody','tr','td','th']),
                    allowedAttributes: { a: ['href', 'name', 'target'], img: ['src', 'alt', 'width', 'height'], '*': ['style'] },
                    allowedSchemes: ['http','https','data','cid']
                }),
                snippet: parsedMail.text?.slice(0, 200) || '',
                unread: false
            });
        } catch (imapErr) {
            console.error('IMAP fetch single failed:', imapErr);
            return res.status(500).json({ error: 'Failed to fetch message' });
        }
        
    } catch (error) {
        console.error('Get email error:', error);
        res.status(500).json({
            error: 'Failed to fetch email',
            details: error.message
        });
    }
};

// Helper function to create email message
function createMessage({ from, to, subject, body, cc, bcc }) {
    const lines = [];
    
    lines.push(`From: ${from}`);
    lines.push(`To: ${to}`);
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    lines.push(`Subject: ${subject}`);
    lines.push('Content-Type: text/html; charset=UTF-8');
    lines.push('');
    lines.push(body);
    
    const message = lines.join('\r\n');
    const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
        
    return encodedMessage;
}

// Helper function to parse email details
function parseEmailDetails(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
    
    let body = '';
    const extractBody = (payload) => {
        if (payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }
        if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                    if (part.body?.data) {
                        return Buffer.from(part.body.data, 'base64').toString('utf-8');
                    }
                }
                if (part.parts) {
                    const nestedBody = extractBody(part);
                    if (nestedBody) return nestedBody;
                }
            }
        }
        return '';
    };
    
    body = extractBody(message.payload);
    
    return {
        id: message.id,
        threadId: message.threadId,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        body: body,
        snippet: message.snippet,
        unread: message.labelIds?.includes('UNREAD') || false
    };
}
