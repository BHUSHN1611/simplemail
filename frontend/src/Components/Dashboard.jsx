import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import EmailClient from './EmailClient';
import { Mail, Star, Send, File, Search, Menu, Plus, User, Inbox, X, Minus, Maximize2, Minimize2 } from 'lucide-react';


const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedMail, setSelectedMail] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState('Inbox');
  const [statusMessage, setStatusMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Get user credentials from navigation state
  const userEmail = location.state?.email || '';
  const appPassword = location.state?.appPassword || '';
  const userName = location.state?.userName || userEmail.split('@')[0];

  // Redirect if no credentials
  useEffect(() => {
    if (!userEmail || !appPassword) {
      navigate('/login');
    }
  }, [userEmail, appPassword, navigate]);

  // Listen for compose send event
  useEffect(() => {
    const handleComposeSend = async (event) => {
      const { to, subject, body } = event.detail;
      
      setSendingEmail(true);
      setStatusMessage('📤 Sending email...');

      try {
        const response = await fetch('http://localhost:5000/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            appPassword: appPassword,
            to,
            subject,
            body
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email');
        }

        setStatusMessage('✅ Email sent successfully!');
        setComposeOpen(false);
        
        // Clear message after 3 seconds
        setTimeout(() => setStatusMessage(''), 3000);
      } catch (error) {
        console.error('Send error:', error);
        setStatusMessage(`❌ Failed to send: ${error.message}`);
        setTimeout(() => setStatusMessage(''), 5000);
      } finally {
        setSendingEmail(false);
      }
    };

    window.addEventListener('dashboardComposeSend', handleComposeSend);
    return () => window.removeEventListener('dashboardComposeSend', handleComposeSend);
  }, [userEmail, appPassword]);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="flex h-screen text-white" style={{ backgroundColor: '#010312' }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setComposeOpen={setComposeOpen}
          activeFolder={activeFolder}
          setActiveFolder={setActiveFolder}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            userName={userName}
            handleLogout={handleLogout}
          />
          <EmailClient 
            activeFolder={activeFolder}
            userEmail={userEmail}
            appPassword={appPassword}
          />
        </div>
      </div>

      <ComposeWindow 
        composeOpen={composeOpen} 
        setComposeOpen={setComposeOpen} 
        sendingEmail={sendingEmail} 
      />

      {/* Status Message Display */}
      {statusMessage && (
        <div className={`fixed bottom-4 right-4 p-3 lg:p-4 rounded-lg text-white shadow-lg border-l-4 z-50 max-w-sm ${
          statusMessage.includes('✅')
            ? 'bg-green-600 border-green-400'
            : statusMessage.includes('❌')
            ? 'bg-red-600 border-red-400'
            : 'bg-blue-600 border-blue-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm lg:text-base">{statusMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

function Header({ setSidebarOpen, sidebarOpen, userName, handleLogout }) {
  return (
    <header className="h-16 lg:h-20 border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-5" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="flex items-center gap-3 lg:gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors p-1">
          <Menu size={20} className="lg:w-6 lg:h-6" />
        </button>
        <div className="flex items-center gap-2 lg:gap-3">
          <Mail style={{ color: '#6633EE' }} size={24} className="lg:w-8 lg:h-8" />
          <h1 className="text-lg lg:text-xl xl:text-2xl font-semibold">QUMAIL</h1>
        </div>
      </div>

      <div className="flex-1 max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl mx-4 sm:mx-6 lg:mx-8">
        <div className="relative">
          <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            placeholder="Search mail..."
            className="w-full border border-gray-700 rounded-lg pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-3 text-sm lg:text-base focus:outline-none focus:border-blue-600 transition-colors"
            style={{ backgroundColor: '#1a1f2e' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3">
        <button style={{ backgroundColor: '#6633EE' }} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center">
          <User size={18} className="lg:w-5 lg:h-5" />
        </button>
        <h4 className="font-mono text-sm lg:text-base hidden sm:block">{userName}</h4>
        <button
          style={{ backgroundColor: '#6633EE' }}
          onClick={handleLogout}
          className="text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-2 rounded text-white transition-colors hover:bg-purple-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

function Sidebar({ sidebarOpen, setComposeOpen, activeFolder, setActiveFolder }) {
  const folders = [
    { icon: Inbox, label: 'Inbox', count: null },
    { icon: Star, label: 'Starred', count: null },
    { icon: Send, label: 'Sent', count: null },
    { icon: File, label: 'Drafts', count: null },
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64 lg:w-72 xl:w-80 2xl:w-96' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-800`} style={{ backgroundColor: '#0a0f1e' }}>
      <div className="p-3 lg:p-4 xl:p-6">
        <button
          onClick={() => setComposeOpen(true)}
          style={{ backgroundColor: '#6633EE' }}
          className="w-full text-white rounded-lg px-3 lg:px-4 py-2 lg:py-3 xl:py-4 flex items-center justify-center gap-2 lg:gap-3 transition-colors hover:bg-purple-700 text-sm lg:text-base"
        >
          <Plus size={18} className="lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">Compose</span>
        </button>
      </div>

      <nav className="px-2 lg:px-3">
        {folders.map((folder) => (
          <button
            key={folder.label}
            onClick={() => setActiveFolder(folder.label)}
            className={`w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${activeFolder === folder.label ? 'bg-[#1a1f2e] text-white' : 'text-gray-300 hover:bg-[#1a1f2e] hover:text-white'}`}>
            <folder.icon size={16} className="lg:w-5 lg:h-5" />
            <span className="flex-1 text-left">{folder.label}</span>
            {folder.count && <span className="text-xs bg-gray-700 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">{folder.count}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ComposeWindow({ composeOpen, setComposeOpen, sendingEmail = false }) {
  const [localTo, setLocalTo] = useState('');
  const [localSubject, setLocalSubject] = useState('');
  const [localBody, setLocalBody] = useState('');
  const textareaRef = React.useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (textareaRef.current && !isMinimized) {
      textareaRef.current.focus();
    }
  }, [isMinimized]);

  useEffect(() => {
    if (composeOpen) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [composeOpen]);

  const handleSend = () => {
    if (!localTo.trim() || !localSubject.trim() || !localBody.trim()) {
      return;
    }

    const ev = new CustomEvent('dashboardComposeSend', { 
      detail: { 
        to: localTo, 
        subject: localSubject, 
        body: localBody 
      } 
    });
    window.dispatchEvent(ev);
    
    // Clear form
    setLocalTo('');
    setLocalSubject('');
    setLocalBody('');
  };

  if (!composeOpen) return null;

  const containerStyle = isMaximized
    ? {
        height: 'calc(100vh - 2rem)',
        width: 'calc(100vw - 2rem)',
        right: '1rem',
        bottom: '1rem'
      }
    : isMinimized
    ? {
        height: '52px',
        width: '320px',
        right: '1rem',
        bottom: '1rem'
      }
    : {
        height: '620px',
        width: '620px',
        right: '1rem',
        bottom: '1rem'
      };

  return (
    <div
      className="border border-gray-700 rounded-lg fixed bottom-0 right-8 flex flex-col shadow-2xl transition-all duration-300 ease-in-out"
      style={{
        ...containerStyle,
        backgroundColor: '#0f1419',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(102, 51, 238, 0.2)'
      }}
    >
      <div
        className="rounded-t-lg flex items-center justify-between px-3 lg:px-4 xl:px-6 py-2 lg:py-3 cursor-move border-b border-gray-800"
        style={{
          backgroundColor: '#1a1f2e',
          background: 'linear-gradient(135deg, #1a1f2e 0%, #151a2a 100%)'
        }}
      >
        <div className="flex items-center gap-2 lg:gap-3">
          <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${sendingEmail ? 'bg-yellow-500 animate-pulse' : 'bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse'}`}></div>
          <h3 className="font-semibold text-sm lg:text-base xl:text-lg text-gray-100">
            New Message {sendingEmail && <span className="text-yellow-400">• Sending...</span>}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-1.5 lg:p-2 rounded-md transition-all"
          >
            <Minus size={14} className="lg:w-4 lg:h-4" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-1.5 lg:p-2 rounded-md transition-all"
          >
            {isMaximized ? <Minimize2 size={14} className="lg:w-4 lg:h-4" /> : <Maximize2 size={14} className="lg:w-4 lg:h-4" />}
          </button>
          <button
            onClick={() => setComposeOpen(false)}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1.5 lg:p-2 rounded-md transition-all ml-1"
          >
            <X size={14} className="lg:w-4 lg:h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 lg:px-4 xl:px-6 py-2 lg:py-3 border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-gray-500 text-sm lg:text-base font-medium min-w-[50px] lg:min-w-[70px]">To:</span>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={localTo}
                  onChange={(e) => setLocalTo(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm lg:text-base text-gray-200 placeholder-gray-600"
                />
              </div>
            </div>

            <div className="px-3 lg:px-4 xl:px-6 py-2 lg:py-3 border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-gray-500 text-sm lg:text-base font-medium min-w-[50px] lg:min-w-[70px]">Subject:</span>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={localSubject}
                  onChange={(e) => setLocalSubject(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm lg:text-base text-gray-200 placeholder-gray-600"
                />
              </div>
            </div>

            <div className="flex-1 px-3 lg:px-4 xl:px-6 py-2 lg:py-3 overflow-y-auto">
              <textarea
                ref={textareaRef}
                placeholder="Write your message here..."
                value={localBody}
                onChange={(e) => setLocalBody(e.target.value)}
                className="w-full h-full bg-transparent border-none focus:outline-none text-sm lg:text-base text-gray-200 placeholder-gray-600 resize-none leading-relaxed"
                style={{ minHeight: '150px' }}
              />
            </div>
          </div>

          <div
            className="px-3 lg:px-4 xl:px-6 py-2 lg:py-3 flex items-center justify-between border-t border-gray-800 rounded-b-lg"
            style={{
              backgroundColor: '#1a1f2e',
              background: 'linear-gradient(135deg, #151a2a 0%, #1a1f2e 100%)'
            }}
          >
            <button
              onClick={handleSend}
              disabled={!localTo || !localSubject || !localBody || sendingEmail}
              className="px-4 lg:px-6 xl:px-8 py-2 lg:py-2.5 xl:py-3 rounded-lg transition-all flex items-center gap-2 lg:gap-3 font-medium text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 disabled:hover:shadow-none"
              style={{
                backgroundColor: (localTo && localSubject && localBody && !sendingEmail) ? '#6633EE' : '#4a4a5e',
                color: 'white'
              }}
            >
              {sendingEmail ? (
                <>
                  <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <span className="text-sm text-gray-400">
              {localTo || 'No recipient'} • {localSubject || 'No subject'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;