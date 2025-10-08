import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailClient from './EmailClient';
import { sendEmail } from './Api';
import './Dashboard.css'
import { Mail, Star, Send, File, Search, Menu, Plus, User, Inbox, X } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const [selectedMail, setSelectedMail] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebar-open');
      return stored ? JSON.parse(stored) : true;
    } catch (e) {
      return true;
    }
  });

  const [composeOpen, setComposeOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState('Inbox');
  const [statusMessage, setStatusMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // load user info once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user-info');
      if (raw) setUserInfo(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user-info');
    navigate('/login');
  };

  // Persist sidebar open state
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
    } catch (e) {}
  }, [sidebarOpen]);

  // Listen for compose send events from ComposeWindow
  useEffect(() => {
    const handler = async (e) => {
      try {
        setSendingEmail(true);
        setStatusMessage('');
        const data = (e && e.detail) ? e.detail : {};
        const payload = { to: data.to || '', subject: data.subject || '', body: data.body || '', cc: '', bcc: '' };
        await sendEmail(payload);
        setStatusMessage('Email sent');
        setComposeOpen(false);
        // notify other parts of app to refresh
        window.dispatchEvent(new CustomEvent('mailSent'));
      } catch (err) {
        console.error('Send failed', err);
        setStatusMessage('Failed to send');
      } finally {
        setSendingEmail(false);
      }
    };

    window.addEventListener('dashboardComposeSend', handler);
    return () => window.removeEventListener('dashboardComposeSend', handler);
  }, []);

  return (
    <div className="dashboard">
      <div className="flex h-screen text-gray-100" style={{ backgroundColor: '#010312' }}>
        <Sidebar sidebarOpen={sidebarOpen} setComposeOpen={setComposeOpen} activeFolder={activeFolder} setActiveFolder={setActiveFolder} />
        <div className="flex-1 flex flex-col">
          <Header
            setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            userInfo={userInfo}
            handleLogout={handleLogout}
          />
          <EmailClient activeFolder={activeFolder} />
        </div>
      </div>

      <ComposeWindow composeOpen={composeOpen} setComposeOpen={setComposeOpen} />
    </div>
  );
};

function Header({ setSidebarOpen, sidebarOpen, userInfo, handleLogout }) {
  return (
    <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 py-5" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
          <Mail style={{ color: '#6633EE' }} size={28} />
          <h1 className="text-xl font-semibold">QUMAIL</h1>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search mail..."
            className="w-full border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-600 transition-colors"
            style={{ backgroundColor: '#1a1f2e' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button style={{ backgroundColor: '#6633EE' }} className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={20} />
        </button>
        <h4 className="font-mono">{userInfo?.name}</h4>
        <button style={{ backgroundColor: '#6633EE' }} onClick={handleLogout} className="ml-3 text-sm  px-2 py-1 rounded text-white">
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
    <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-gray-800`} style={{ backgroundColor: '#0a0f1e' }}>
      <div className="p-4">
        <button
          onClick={() => setComposeOpen(true)}
          style={{ backgroundColor: '#6633EE' }}
          className="w-full text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Compose
        </button>
      </div>

      <nav className="px-2">
        {folders.map((folder) => (
          <button
            key={folder.label}
            onClick={() => setActiveFolder(folder.label)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeFolder === folder.label ? 'bg-[#1a1f2e] text-white' : 'text-gray-300 hover:bg-[#1a1f2e] hover:text-white'}`}>
            <folder.icon size={18} />
            <span className="flex-1 text-left text-sm">{folder.label}</span>
            {folder.count && <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{folder.count}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ComposeWindow({ composeOpen, setComposeOpen }) {
  const [localTo, setLocalTo] = useState('');
  const [localSubject, setLocalSubject] = useState('');
  const [localBody, setLocalBody] = useState('');
  const textareaRef = React.useRef(null);

  useEffect(() => {
    if (composeOpen) {
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [composeOpen]);

  if (!composeOpen) return null;

  return (
    <div className="border-1 rounded-sm fixed bottom-0 right-8 w-[520px] flex flex-col" style={{ height: '520px', backgroundColor: '#0a0f1e' }}>
      <div className="rounded-sm flex items-center justify-between p-3" style={{ backgroundColor: '#151a29' }}>
        <h3 className="font-semibold">New Message</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setComposeOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-800">
          <input
            type="email"
            placeholder="To"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-200 placeholder-gray-500"
          />
        </div>
        <div className="p-3 border-b border-gray-800">
          <input
            type="text"
            placeholder="Subject"
            value={localSubject}
            onChange={(e) => setLocalSubject(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-200 placeholder-gray-500"
          />
        </div>
        <div className="flex-1 p-3">
          <textarea
            ref={textareaRef}
            placeholder="Compose email..."
            value={localBody}
            onChange={(e) => setLocalBody(e.target.value)}
            className="w-full h-full bg-transparent border-none focus:outline-none text-sm text-gray-200 placeholder-gray-500 resize-none"
          />
        </div>
      </div>

      <div className="p-3 flex items-center justify-between rounded-sm" style={{ backgroundColor: '#151a29' }}>
        <button
          onClick={() => {
            const ev = new CustomEvent('dashboardComposeSend', { detail: { to: localTo, subject: localSubject, body: localBody } });
            window.dispatchEvent(ev);
          }}
          style={{ backgroundColor: '#6633EE' }}
          className=" text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 "
        >
          <Send size={16} />
          Send
        </button>
      </div>
    </div>
  );
}

export default Dashboard;