import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import Imap from "imap";
import { simpleParser } from "mailparser";

const app = express();
app.use(cors());
app.use(express.json());

// Store active sessions (in production, use Redis or database)
const sessions = new Map();

// Login endpoint
app.post("/login", async (req, res) => {
  const { gmail, appPassword } = req.body;

  try {
    // Verify credentials with nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,
        pass: appPassword,
      },
    });

    await transporter.verify();

    // Store session
    const sessionId = Date.now().toString();
    sessions.set(sessionId, { gmail, appPassword });

    const name = gmail.split("@")[0];

    res.json({ 
      success: true, 
      name,
      sessionId 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  }
});

// Fetch mails endpoint
app.post('/fetch-mails', async (req, res) => {
  const { email, appPassword, maxEmails = 10 } = req.body;

  if (!email || !appPassword) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password required" 
    });
  }

  try {
    const emails = await fetchImapEmails(email, appPassword, maxEmails);
    res.json({ success: true, mails: emails });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send email endpoint
app.post('/send-email', async (req, res) => {
  const { email, appPassword, to, subject, body } = req.body;

  if (!email || !appPassword || !to || !subject) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields" 
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass: appPassword,
      },
    });

    const info = await transporter.sendMail({
      from: email,
      to: to,
      subject: subject,
      text: body,
      html: `<div style="font-family: Arial, sans-serif;">${body.replace(/\n/g, '<br>')}</div>`
    });

    res.json({ 
      success: true, 
      messageId: info.messageId,
      message: "Email sent successfully" 
    });
  } catch (error) {
    console.error("Send error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to fetch emails via IMAP
function fetchImapEmails(email, password, maxEmails = 10) {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    const emails = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          imap.end();
          return resolve([]);
        }

        // Fetch the last N messages
        const start = Math.max(1, totalMessages - maxEmails + 1);
        const fetchRange = `${start}:${totalMessages}`;
        
        const fetch = imap.seq.fetch(fetchRange, {
          bodies: '',
          struct: true
        });

        fetch.on('message', (msg, seqno) => {
          msg.on('body', (stream) => {
            simpleParser(stream, (err, parsed) => {
              if (err) {
                console.error('Parse error:', err);
                return;
              }

              emails.push({
                id: seqno,
                subject: parsed.subject || '(No Subject)',
                from: parsed.from?.text || parsed.from?.value?.[0]?.address || 'Unknown',
                to: parsed.to?.text || email,
                date: parsed.date ? new Date(parsed.date).toLocaleString() : 'Unknown date',
                text: parsed.text || parsed.textAsHtml || '(No content)',
                html: parsed.html || null,
                snippet: (parsed.text || '').substring(0, 150) + '...'
              });
            });
          });
        });

        fetch.once('error', (err) => {
          imap.end();
          reject(err);
        });

        fetch.once('end', () => {
          imap.end();
        });
      });
    });

    imap.once('error', (err) => {
      reject(new Error('IMAP connection failed: ' + err.message));
    });

    imap.once('end', () => {
      // Sort by date (most recent first)
      emails.sort((a, b) => new Date(b.date) - new Date(a.date));
      resolve(emails);
    });

    imap.connect();
  });
}

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});