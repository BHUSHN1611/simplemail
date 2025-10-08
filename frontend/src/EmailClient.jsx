import React, { useState, useEffect } from 'react';
import { sendEmail, getEmails, getEmailById } from './Api';
import { Star, File, Mail } from 'lucide-react';

// Email List Item Component
function EmailListItem({ email, selectedEmail, handleEmailClick, starred, toggleStar }) {
  return (
    <div
      onClick={() => handleEmailClick(email)}
      className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
        selectedEmail?.id === email.id ? 'bg-[#1a1f2e]' : 'hover:bg-[#151a29]'
      } ${email.unread ? 'border-l-4 border-l-blue-600' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(email.id);
          }}
          className="mt-1"
        >
          <Star
            size={16}
            className={`${
              starred.has(email.id)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-600 hover:text-gray-400'
            } transition-colors`}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm ${email.unread ? 'font-semibold text-white' : 'text-gray-300'}`}>
              {email.from}
            </span>
            <span className="text-xs text-gray-500">{email.time}</span>
          </div>
          <p className={`text-sm mb-1 ${email.unread ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
            {email.subject}
          </p>
          <p className="text-xs text-gray-500 truncate">{email.preview}</p>
          {email.hasAttachment && (
            <div className="flex items-center gap-1 mt-2">
              <File size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">Attachment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Email List Component
function EmailList({ emails, selectedEmail, handleEmailClick, starred, toggleStar, onCompose, onRefresh, onLoadMore, nextPageToken, activeFolder }) {
  return (
    <div className="w-96 border-r border-gray-800 overflow-y-auto" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">{activeFolder}</h2>
          <div className="flex gap-2">
            <button onClick={onCompose} className="text-blue-400 hover:text-blue-300">✏️</button>
            <button onClick={onRefresh} className="text-gray-400 hover:text-gray-300">🔄</button>
          </div>
        </div>
        <p className="text-sm text-gray-400">{emails.length} Mails</p>
      </div>

      {emails.map((email) => (
        <EmailListItem
          key={email.id}
          email={email}
          selectedEmail={selectedEmail}
          handleEmailClick={handleEmailClick}
          starred={starred}
          toggleStar={toggleStar}
        />
      ))}
      {nextPageToken && (
        <div className="p-3">
          <button onClick={onLoadMore} className="w-full bg-gray-700 text-white py-2 rounded">Load more</button>
        </div>
      )}
    </div>
  );
}

// Email Detail Component
function EmailDetail({ selectedEmail }) {
  if (!selectedEmail) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Mail size={64} className="mx-auto mb-4 opacity-50" />
          <p>Select an email to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4">{selectedEmail.subject}</h1>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold">
            {selectedEmail.from[0]}
          </div>
          <div className="flex-1">
            <p className="font-medium">{selectedEmail.from}</p>
            <p className="text-sm text-gray-400">to me</p>
          </div>
          <span className="text-sm text-gray-400">{selectedEmail.time}</span>
        </div>
      </div>

      <div className="email-detail">
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          style={{backgroundColor:"#6633EE"}}
          className="text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90">
          Reply
        </button>
        <button
          className="bg-[#1a1f2e] hover:bg-[#242938] text-gray-300 px-4 py-2 rounded-lg transition-colors">
          Forward
        </button>
      </div>
    </div>
  );
}

function EmailClient({ activeFolder = 'Inbox' }) {
    const [emails, setEmails] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showCompose, setShowCompose] = useState(false);
    const [loading, setLoading] = useState(false);
    const [composeData, setComposeData] = useState({
        to: '',
        subject: '',
        body: '',
        cc: '',
        bcc: ''
    });
    const [sendingEmail, setSendingEmail] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [starred, setStarred] = useState(new Set());
    
    const toggleStar = (id) => {
        setStarred(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

  useEffect(() => {
    // map activeFolder to query
    const folderQueryMap = {
      'Inbox': '',
      'Starred': 'is:starred',
      'Sent': 'in:sent',
      'Drafts': 'in:drafts'
    };
    const q = folderQueryMap[activeFolder] || '';
    fetchEmails({ q });
  }, [activeFolder]);

    useEffect(() => {
      const onMailSent = () => {
        setStatusMessage('Email sent successfully');
        fetchEmails();
        setTimeout(() => setStatusMessage(''), 3000);
      };
      window.addEventListener('mailSent', onMailSent);
      return () => window.removeEventListener('mailSent', onMailSent);
    }, []);

  // Helper: extract an email address from a display string like "Name <addr@example.com>" or just "addr@example.com"
  const extractEmail = (str) => {
    if (!str || typeof str !== 'string') return null;
    const re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const match = str.match(re);
    return match ? match[0].toLowerCase() : null;
  };

  // Helper to determine if a date string corresponds to today (local timezone)
  const isToday = (dateInput) => {
    if (!dateInput) return false;
    const d = new Date(dateInput);
    if (isNaN(d)) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const [nextPageToken, setNextPageToken] = useState(null);

  const fetchEmails = async (opts = {}) => {
    setLoading(true);
    try {
      const response = await getEmails({ q: opts.q || '', pageToken: opts.pageToken || '', limit: opts.limit || 20 });
      const all = response.data.emails || [];
      // append or replace
      setEmails(prev => opts.append ? [...prev, ...all] : all);
      setNextPageToken(response.data.nextPageToken || null);
      // If currently selected email is not in the list, clear it
      setSelectedEmail(prev => (prev && (opts.append ? [...emails, ...all].some(x => x.id === prev.id) : all.some(x => x.id === prev.id))) ? prev : null);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setStatusMessage('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = async (email) => {
    try {
      // API expects provider-prefixed ids (gmail:..., imap:...)
      const response = await getEmailById(email.id);
      setSelectedEmail(response.data);
            
      // Update email list to mark as read
      setEmails(emails.map(e => e.id === email.id ? { ...e, unread: false } : e));
    } catch (error) {
      console.error('Error fetching email details:', error);
      setStatusMessage('Failed to load message');
    }
  };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setSendingEmail(true);
        setStatusMessage('');

        try {
            await sendEmail(composeData);
            setStatusMessage('Email sent successfully!');
            setShowCompose(false);
            setComposeData({ to: '', subject: '', body: '', });
            
            // Optionally refresh inbox
            fetchEmails();
        } catch (error) {
            console.error('Error sending email:', error);
            setStatusMessage('Failed to send email');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleComposeChange = (e) => {
        setComposeData({
            ...composeData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex h-screen bg-[#0a0f1e] text-white">
      <EmailList
        emails={emails}
        selectedEmail={selectedEmail}
        handleEmailClick={handleEmailClick}
        starred={starred}
        toggleStar={toggleStar}
        onCompose={() => setShowCompose(true)}
        onRefresh={fetchEmails}
        onLoadMore={() => fetchEmails({ pageToken: nextPageToken, append: true })}
        nextPageToken={nextPageToken}
        activeFolder={activeFolder}
      />
            <div className="flex-1 flex flex-col min-w-0">
                {loading && <div className="p-4 text-center">Loading emails...</div>}
                <div className="flex-1 overflow-auto min-h-0">
                  <EmailDetail selectedEmail={selectedEmail} />
                </div>
            </div>
            {showCompose && (

                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1f2e] p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">New Message</h3>
                            <button onClick={() => setShowCompose(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSendEmail}>
                            <input
                                type="email"
                                name="to"
                                placeholder="To"
                                value={composeData.to}
                                onChange={handleComposeChange}
                                required
                                className="w-full p-2 mb-2 bg-[#242938] border border-gray-600 rounded text-white"
                            />
                            <input
                                type="text"
                                name="subject"
                                placeholder="Subject"
                                value={composeData.subject}
                                onChange={handleComposeChange}
                                required
                                className="w-full p-2 mb-2 bg-[#242938] border border-gray-600 rounded text-white"
                            />
                            <textarea
                                name="body"
                                placeholder="Message"
                                value={composeData.body}
                                onChange={handleComposeChange}
                                rows="6"
                                required
                                className="w-full p-2 mb-4 bg-[#242938] border border-gray-600 rounded text-white"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCompose(false)}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white disabled:opacity-50"
                                >
                                    {sendingEmail ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {statusMessage && (
                <div className={`fixed bottom-4 right-4 p-4 rounded text-white ${statusMessage.includes('success') ? 'bg-green-600' : 'bg-red-600'}`}>
                    {statusMessage}
                </div>
            )}
        </div>
    );
}

export default EmailClient;