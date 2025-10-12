import React, { useState, useCallback } from 'react';
import { Star, File, Mail } from 'lucide-react';


// Helper to determine if a date string corresponds to today (local timezone)
const isToday = (dateInput) => {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d)) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

// Helper to format time in a user-friendly way
const formatTime = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d)) return dateInput;

  if (isToday(d)) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};


// Email List Item Component
function EmailListItem({ email, selectedEmail, handleEmailClick, starred, toggleStar }) {
  return (
    <div
      onClick={() => handleEmailClick(email)}
      className={`p-3 lg:p-4 xl:p-5 border-b border-gray-800 cursor-pointer transition-colors ${
        selectedEmail?.id === email.id ? 'bg-[#1a1f2e]' : 'hover:bg-[#151a29]'
      } ${email.unread ? 'border-l-4 border-l-blue-600' : ''}`}
    >
      <div className="flex items-start gap-2 lg:gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(email.id);
          }}
          className="mt-1 flex-shrink-0"
        >
          <Star
            size={14}
            className={`lg:w-4 lg:h-4 ${
              starred.has(email.id)
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-600 hover:text-gray-400'
            } transition-colors`}
          />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs lg:text-sm xl:text-base ${email.unread ? 'font-semibold text-white' : 'text-gray-300'}`}>
              {email.from}
            </span>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{email.time}</span>
          </div>
          <p className={`text-xs lg:text-sm xl:text-base mb-1 ${email.unread ? 'font-medium text-gray-200' : 'text-gray-400'}`}>
            {email.subject}
          </p>
          <p className="text-xs text-gray-500 truncate">{email.preview}</p>
          {email.hasAttachment && (
            <div className="flex items-center gap-1 mt-1 lg:mt-2">
              <File size={10} className="lg:w-3 lg:h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Attachment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Email List Component
function EmailList({ emails, selectedEmail, handleEmailClick, starred, toggleStar, onLogout, activeFolder, folders, currentFolder, onFolderChange }) {

  return (
    <div className="w-80 sm:w-96 lg:w-80 xl:w-96 2xl:w-[28rem] border-r border-gray-800 h-full overflow-y-auto" style={{ backgroundColor: '#0a0f1e' }}>
      <div className="p-3 lg:p-4 xl:p-6 border-b border-gray-800">
        <div className="flex justify-between items-center mb-2 lg:mb-3">
          <h2 className="font-semibold text-base lg:text-lg xl:text-xl">{activeFolder}</h2>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-white text-xs lg:text-sm transition-colors px-2 py-1"
          >
            Logout
          </button>
        </div>

        {/* Folder Navigation */}
        <div className="mb-3 lg:mb-4 space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.name}
              onClick={() => onFolderChange(folder.name)}
              className={`w-full text-left px-2 lg:px-3 py-1.5 lg:py-2 rounded text-xs lg:text-sm xl:text-base transition-colors ${
                currentFolder === folder.name
                  ? 'bg-[#6633EE] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#151a29]'
              }`}
            >
              <span className="flex items-center justify-between">
                <span>{folder.name}</span>
                <span className="text-xs">({folder.count})</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs lg:text-sm text-gray-400">{emails.length} Mails</p>
      </div>

      {emails.length > 0 && (
        <>
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
        </>
      )}
      
    </div>
  );
}

// Email Detail Component
function EmailDetail({ selectedEmail }) {
  if (!selectedEmail) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 p-4">
        <div className="text-center">
          <Mail size={48} className="lg:w-16 lg:h-16 xl:w-20 xl:h-20 mx-auto mb-3 lg:mb-4 opacity-50" />
          <p className="text-sm lg:text-base xl:text-lg">Select an email to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 xl:p-8 2xl:p-12">
      <div className="mb-4 lg:mb-6 xl:mb-8">
        <h1 className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold mb-3 lg:mb-4">{selectedEmail.subject}</h1>
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
            {selectedEmail.from[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm lg:text-base xl:text-lg truncate">{selectedEmail.from}</p>
            <p className="text-xs lg:text-sm text-gray-400">to me</p>
          </div>
          <span className="text-xs lg:text-sm text-gray-400 flex-shrink-0">{selectedEmail.time}</span>
        </div>
      </div>

      <div className="email-detail mb-6 lg:mb-8">
        <div className="prose prose-invert max-w-none">
          <div
            className="text-sm lg:text-base xl:text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
          />
        </div>
      </div>

      <div className="flex gap-2 lg:gap-3 xl:gap-4">
        <button
          style={{backgroundColor:"#6633EE"}}
          className="text-white px-3 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 rounded-lg transition-colors hover:opacity-90 text-sm lg:text-base">
          Reply
        </button>
        <button
          className="bg-[#1a1f2e] hover:bg-[#242938] text-gray-300 px-3 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 rounded-lg transition-colors text-sm lg:text-base">
          Forward
        </button>
      </div>
    </div>
  );
}
// Email Detail Component


function EmailClient({ activeFolder = 'Inbox' }) {
  const [currentFolder, setCurrentFolder] = useState('Inbox');
  const [sentEmails, setSentEmails] = useState([]);

  let inboxEmails = [
    {
      id: 1,
      from: 'Sarah Chen',
      subject: 'Q4 Project Review Meeting',
      preview: 'Hi team, I wanted to schedule our quarterly review for next week...',
      time: '10:30 AM',
      unread: true,
      hasAttachment: true,
      body: `
        <h2>Q4 Project Review Meeting</h2>
        <p>Hi team,</p>
        <p>I wanted to schedule our quarterly review for next week. We'll be discussing the progress on all ongoing projects and planning for the upcoming quarter.</p>
        <h3>Agenda:</h3>
        <ul>
          <li>Project status updates</li>
          <li>Q4 goals and objectives</li>
          <li>Resource allocation</li>
          <li>Risk assessment</li>
          <li>Next steps and action items</li>
        </ul>
        <p>Please come prepared with your project updates and any concerns you'd like to discuss.</p>
        <p>Best regards,<br>Sarah Chen<br>Project Manager</p>
      `
    },
    {
      id: 2,
      from: 'GitHub',
      subject: 'Your pull request was merged',
      preview: 'feat: Add dark mode support - Pull request #482 has been successfully merged...',
      time: '9:15 AM',
      unread: true,
      hasAttachment: false,
      body: `
        <div style="background: #0d1117; color: #e6edf3; padding: 24px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
          <div style="border-bottom: 1px solid #30363d; padding-bottom: 16px; margin-bottom: 16px;">
            <h2 style="color: #58a6ff; margin: 0 0 8px 0;">✅ Pull Request Merged</h2>
            <p style="color: #8b949e; margin: 0;">Your pull request has been successfully merged into the main branch</p>
          </div>
          <div style="background: #161b22; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <strong>PR #482:</strong> feat: Add dark mode support<br>
            <strong>Repository:</strong> qumail-app<br>
            <strong>Branch:</strong> feature/dark-mode<br>
            <strong>Merged by:</strong> @alexchen
          </div>
          <p>The dark mode feature is now available in the main application. Users can toggle between light and dark themes in their preferences.</p>
          <button style="background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">View Changes</button>
        </div>
      `
    },
    {
      id: 3,
      from: 'Michael Roberts',
      subject: 'Design feedback needed',
      preview: 'I\'ve reviewed the latest mockups and have some thoughts to share...',
      time: 'Yesterday',
      unread: false,
      hasAttachment: true,
      body: `
        <p>Hi there!</p>
        <p>I've reviewed the latest mockups and have some thoughts to share. Overall, the direction looks great, but I have a few suggestions that could improve the user experience.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin-top: 0; color: #000000;">Key Feedback Points:</h3>
          <ul style="margin-bottom: 0; color: #000000;">
            <li>Consider increasing the contrast for better accessibility</li>
            <li>The navigation could benefit from better visual hierarchy</li>
            <li>Button states need more distinct hover effects</li>
            <li>Mobile responsiveness looks good overall</li>
          </ul>
        </div>
        <p>I've attached the revised mockups with my suggested changes. Let me know your thoughts!</p>
        <p>Best regards,<br>Michael Roberts<br>UX Designer</p>
      `
    },
    {
      id: 4,
      from: 'Newsletter',
      subject: 'Weekly Tech Digest',
      preview: 'Top stories this week: AI advancements, new framework releases...',
      time: 'Yesterday',
      unread: false,
      hasAttachment: false,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed; text-align: center;">🚀 Weekly Tech Digest</h1>
          <h2>Issue #47: AI and Web Development Trends</h2>
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFJIEEkIFdlYiBEZXZlbG9wbWVudDwvdGV4dD48L3N2Zz4=" alt="AI and Web Development" style="max-width: 100%; height: auto; border-radius: 8px;">
          <h3>Top Stories This Week:</h3>
          <ul>
            <li><strong>AI Breakthrough:</strong> New language model achieves 99% accuracy in code generation</li>
            <li><strong>Framework Updates:</strong> React 19 release candidate now available</li>
            <li><strong>Security Alert:</strong> Critical vulnerability found in popular npm packages</li>
            <li><strong>Web Vitals:</strong> Google announces new performance metrics</li>
          </ul>
          <p><a href="#" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Read Full Newsletter</a></p>
        </div>
      `
    },
    {
      id: 5,
      from: 'Emma Wilson',
      subject: 'Budget approval needed',
      preview: 'The finance team needs your approval on the Q1 budget proposal...',
      time: 'Oct 6',
      unread: false,
      hasAttachment: true,
      body: `
        <p>Hi,</p>
        <p>The finance team needs your approval on the Q1 budget proposal. We've put together a comprehensive budget that accounts for all planned initiatives and operational costs.</p>
        <div style="background: #fefce8; border: 2px solid #eab308; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #000000; margin-top: 0;">📊 Budget Summary</h3>
          <p style="color: #000000;"><strong>Total Budget:</strong> $2,450,000</p>
          <p style="color: #000000;"><strong>Key Allocations:</strong></p>
          <ul style="color: #000000;">
            <li>Product Development: 45%</li>
            <li>Marketing & Sales: 25%</li>
            <li>Operations: 20%</li>
            <li>Contingency: 10%</li>
          </ul>
        </div>
        <p>Please review the attached detailed budget document and let me know if you have any questions or need any adjustments.</p>
        <p>Thanks,<br>Emma Wilson<br>Finance Director</p>
      `
    },
    {
      id: 6,
      from: 'Slack',
      subject: 'You have 3 new mentions',
      preview: '@you in #general, #design-team, and #announcements...',
      time: 'Oct 6',
      unread: false,
      hasAttachment: false,
      body: `
        <div style="background: #4a154b; color: white; padding: 24px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
          <h2 style="color: #ecb22e; margin: 0 0 16px 0;">🔔 You have 3 new mentions</h2>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0;"><strong>#general</strong></p>
            <p style="color: #c7c7c7; margin: 0;">@you Hey, are we still on for the team lunch tomorrow?</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0;"><strong>#design-team</strong></p>
            <p style="color: #c7c7c7; margin: 0;">@you Can you review the new icon set when you have a moment?</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
            <p style="margin: 0 0 8px 0;"><strong>#announcements</strong></p>
            <p style="color: #c7c7c7; margin: 0;">@you Company-wide meeting scheduled for Friday at 3 PM</p>
          </div>
          <button style="background: #ecb22e; color: #4a154b; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 16px;">View in Slack</button>
        </div>
      `
    },
    {
      id: 7,
      from: 'David Park',
      subject: 'Re: Client presentation',
      preview: 'Thanks for the update. The slides look great, just a few minor tweaks...',
      time: 'Oct 5',
      unread: false,
      hasAttachment: false,
      body: `
        <p>Thanks for the update. The slides look great, just a few minor tweaks needed before we present to the client.</p>
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #000000; margin-top: 0;">💡 Suggested Changes:</h3>
          <ul style="margin-bottom: 0; color: #000000;">
            <li>Slide 7: Update the revenue projections chart</li>
            <li>Slide 12: Add source citations for statistics</li>
            <li>Slide 15: Include the new product roadmap</li>
            <li>General: Increase font size for better readability</li>
          </ul>
        </div>
        <p>Overall, this is looking really strong. The client should be impressed with our comprehensive approach and the clear value proposition.</p>
        <p>Let me know when the revisions are ready for final review.</p>
        <p>Best,<br>David Park<br>Sales Director</p>
      `
    },
    {
      id: 8,
      from: 'Security Team',
      subject: 'Security update required',
      preview: 'Please update your password as part of our routine security protocol...',
      time: 'Oct 5',
      unread: false,
      hasAttachment: false,
      body: `
        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px;">
          <h2 style="color: #000000; margin-top: 0;">🔒 Security Update Required</h2>
          <p style="color: #000000;">As part of our routine security protocol, we need you to update your password.</p>
          <div style="background: #dc2626; color: white; padding: 10px; border-radius: 4px; text-align: center; margin: 15px 0;">
            <strong>Action Required: Update password by Friday</strong>
          </div>
          <h3 style="color: #000000;">Password Requirements:</h3>
          <ul style="color: #000000;">
            <li>Minimum 12 characters</li>
            <li>Must include uppercase and lowercase letters</li>
            <li>Must include at least one number</li>
            <li>Must include at least one special character</li>
            <li>Cannot reuse previous 5 passwords</li>
          </ul>
          <p style="color: #000000;">Failure to update may result in account suspension.</p>
          <button style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">Update Password</button>
        </div>
      `
    }
  ];

    const [selectedEmail, setSelectedEmail] = useState(null);
    const [starred, setStarred] = useState(new Set());

    // Get current emails based on folder
    const getCurrentEmails = () => {
      if (currentFolder === 'Sent') {
        return sentEmails;
      }
      return inboxEmails;
    };

    // Folder configuration
    const folders = [
      { name: 'Inbox', count: inboxEmails.length },
      { name: 'Sent', count: sentEmails.length }
    ];

    const toggleStar = useCallback((id) => {
        setStarred(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);


  const handleEmailClick = useCallback((email) => {
    setSelectedEmail(email);
  }, []);
  
    const handleLogout = () => {
      localStorage.removeItem('user-info');
      window.location.href = '/';
    };

    const handleFolderChange = (folderName) => {
      setCurrentFolder(folderName);
      setSelectedEmail(null); // Clear selected email when changing folders
    };

    // Get current emails based on selected folder
    const currentEmails = getCurrentEmails();

    return (
        <div className="flex h-screen bg-[#0a0f1e] text-white overflow-hidden">
          <EmailList
            emails={currentEmails}
            selectedEmail={selectedEmail}
            handleEmailClick={handleEmailClick}
            starred={starred}
            toggleStar={toggleStar}
            onLogout={handleLogout}
            activeFolder={currentFolder}
            folders={folders}
            currentFolder={currentFolder}
            onFolderChange={handleFolderChange}
          />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <EmailDetail selectedEmail={selectedEmail} />
            </div>
          </div>
        </div>
    );
}

export default EmailClient;

