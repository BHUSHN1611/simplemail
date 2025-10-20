import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ChevronRight, Star, Clock, User } from 'lucide-react';


const EmailClient = ({ activeFolder, userEmail, appPassword }) => {

  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch emails on mount and when folder changes
  useEffect(() => {
    if (activeFolder === 'Inbox') {
      fetchEmails();
    }
  }, [activeFolder]);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/fetch-mails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          appPassword: appPassword,
          maxEmails: 20 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }

      setEmails(data.mails);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

//   const handleBackToList = () => {
//     setSelectedEmail(null);
//   };

  // Show different content based on folder
  if (activeFolder !== 'Inbox') {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Mail size={64} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg">"{activeFolder}" folder - Coming soon</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto mb-4 animate-spin" style={{ color: '#6633EE' }} />
          <p className="text-gray-300">Loading emails...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchEmails}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email detail view
  if (selectedEmail) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Email detail header */}
        <div className="border-b border-gray-800 p-4 lg:p-6" style={{ backgroundColor: '#0a0f1e' }}>
          {/* <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronRight size={20} className="rotate-180" />
            <span>Back to Inbox</span>
          </button> */}
          
          <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4">
            {selectedEmail.subject}
          </h2>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6633EE' }}>
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{selectedEmail.from}</p>
              <p className="text-gray-400 text-sm">To: {selectedEmail.to}</p>
              <p className="text-gray-500 text-xs mt-1">{selectedEmail.date}</p>
            </div>
          </div>
        </div>

        {/* Email body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div
                className="prose prose-invert max-w-none email-content"
                dangerouslySetInnerHTML={{
                __html:
                    selectedEmail.html ||
                    selectedEmail.text.replace(/\n/g, "<br>"),
                }}
            />
        </div>

      </div>
    );
  }

  // Email list view
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-800 p-4 lg:p-6 flex items-center justify-between" style={{ backgroundColor: '#0a0f1e' }}>
        <h2 className="text-lg lg:text-xl font-semibold text-white">
          Inbox ({emails.length})
        </h2>
        <button
          onClick={fetchEmails}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Mail size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">No emails found</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className="p-4 lg:p-6 hover:bg-gray-900/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6633EE' }}>
                    <User size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                        {email.from}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {email.date}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 font-medium mb-1 truncate">
                      {email.subject}
                    </p>
                    
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {email.snippet}
                    </p>
                  </div>
                  
                  <ChevronRight size={20} className="text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailClient;