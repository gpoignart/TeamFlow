import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, createTask, getUsers } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import { addNotification, NOTIFICATION_TYPES } from '../services/notificationService';
import '../styles/messages.css';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskInitialData, setTaskInitialData] = useState({});

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messagesZoneRef = useRef(null);
  const lastScrollTop = useRef(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    // Load teams
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const userTeams = allTeams.filter(
      t => t.owner === user.id || (t.members || []).some(m => m.email === user.email)
    );
    setTeams(userTeams);
    if (userTeams.length > 0) setSelectedTeamId(userTeams[0].id);
    
    // Load all users for mentions
    loadTeamMembers();
  }, []);

  // Listen for profile updates and reload team members
  useEffect(() => {
    const handleProfileUpdate = () => {
      loadTeamMembers();
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const loadTeamMembers = async () => {
    try {
      const allUsers = await getUsers();
      // Merge with userProfiles data
      const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      const enrichedUsers = allUsers.map(u => ({
        ...u,
        ...(userProfiles[u.id] || {})
      }));
      setTeamMembers(enrichedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const fetchChat = async () => {
    if (!selectedTeamId) return;
    try {
      const data = await getMessages(selectedTeamId);
      
      // Load saved reactions from localStorage
      const savedReactions = localStorage.getItem('messageReactions');
      const reactionsMap = savedReactions ? JSON.parse(savedReactions) : {};
      
      // Load user profiles to enrich messages
      const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
      
      // Merge reactions with messages and enrich with profile data
      const messagesWithReactions = data.map(msg => {
        const savedData = reactionsMap[msg.id];
        const senderProfile = userProfiles[msg.senderId] || {};
        
        // Enrich sender data with profile info
        const enrichedSender = msg.sender ? {
          ...msg.sender,
          username: senderProfile.username || msg.sender.username,
        } : null;
        
        return {
          ...msg,
          sender: enrichedSender,
          username: senderProfile.username || msg.username,
          reactions: savedData?.reactions || msg.reactions || {},
          isPinned: savedData?.isPinned || msg.isPinned || false
        };
      });
      
      setMessages(messagesWithReactions.reverse()); 
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [selectedTeamId]);

  useEffect(() => {
    // Scroll to bottom on first load or when sending message
    if (shouldScrollToBottom && messages.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: isFirstLoad ? 'auto' : 'smooth' });
        if (isFirstLoad) {
          setIsFirstLoad(false);
        }
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [messages, shouldScrollToBottom, isFirstLoad]);

  // Detect manual scroll
  const handleScroll = () => {
    if (messagesZoneRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesZoneRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Detect scroll direction
      const isScrollingUp = scrollTop < lastScrollTop.current;
      lastScrollTop.current = scrollTop;
      
      // If user is scrolling UP, immediately disable auto-scroll
      if (isScrollingUp) {
        setShouldScrollToBottom(false);
      }
      // Only re-enable auto-scroll if user scrolls down to the very bottom
      else if (isAtBottom && !shouldScrollToBottom) {
        setShouldScrollToBottom(true);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedTeamId) return;
    await sendMessage(text, selectedTeamId);
    
    // Extract mentions from the message
    const mentionRegex = /@(\w+)/g;
    const mentions = [...text.matchAll(mentionRegex)].map(match => match[1]);
    
    // Generate notifications for team members
    try {
      const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
      const selectedTeam = allTeams.find(t => String(t.id) === String(selectedTeamId));
      
      if (selectedTeam) {
        const allUsers = await getUsers();
        const teamMemberIds = [];
        
        // Add owner
        teamMemberIds.push(String(selectedTeam.owner));
        
        // Add members
        (selectedTeam.members || []).forEach(member => {
          const memberUser = allUsers.find(u => u.email === member.email);
          if (memberUser) {
            teamMemberIds.push(String(memberUser.id));
          }
        });
        
        // Notify mentioned users
        mentions.forEach(mentionedUsername => {
          const mentionedUser = allUsers.find(u => u.username === mentionedUsername);
          if (mentionedUser && String(mentionedUser.id) !== String(user.id)) {
            addNotification({
              type: NOTIFICATION_TYPES.NEW_MESSAGE,
              title: '💬 You were mentioned',
              message: `${user.username} mentioned you: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
              teamId: selectedTeamId,
              userId: String(mentionedUser.id)
            });
          }
        });
        
        // Notify all other team members (except sender and those already notified by mention)
        const mentionedUserIds = mentions.map(username => {
          const u = allUsers.find(usr => usr.username === username);
          return u ? String(u.id) : null;
        }).filter(Boolean);
        
        teamMemberIds.forEach(userId => {
          if (String(userId) !== String(user.id) && !mentionedUserIds.includes(String(userId))) {
            addNotification({
              type: NOTIFICATION_TYPES.NEW_MESSAGE,
              title: 'New message',
              message: `${user.username}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
              teamId: selectedTeamId,
              userId: userId
            });
          }
        });
      }
    } catch (error) {
      console.error("Error generating message notifications:", error);
    }
    
    setText('');
    setShouldScrollToBottom(true); // Enable scroll after sending
    fetchChat();
  };

  // Handle input change with mention detection
  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setText(value);
    setCursorPosition(cursorPos);

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentionSuggestions(true);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Handle mention selection
  const selectMention = (username) => {
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = text.substring(cursorPosition);
    
    const newText = text.substring(0, lastAtIndex) + `@${username} ` + textAfterCursor;
    setText(newText);
    setShowMentionSuggestions(false);
    inputRef.current?.focus();
  };

  // Toggle reaction on a message
  const toggleReaction = (messageId, emoji) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...(msg.reactions || {}) };
        const userReactionKey = `${user.id}_${emoji}`;
        
        if (reactions[userReactionKey]) {
          delete reactions[userReactionKey];
        } else {
          reactions[userReactionKey] = { userId: user.id, emoji, username: user.username };
        }
        
        return { ...msg, reactions };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    
    // Save reactions to localStorage with message ID as key
    const savedReactions = localStorage.getItem('messageReactions');
    const reactionsMap = savedReactions ? JSON.parse(savedReactions) : {};
    
    updatedMessages.forEach(msg => {
      reactionsMap[msg.id] = {
        reactions: msg.reactions,
        isPinned: msg.isPinned
      };
    });
    
    localStorage.setItem('messageReactions', JSON.stringify(reactionsMap));
  };

  // Toggle pin status
  const togglePin = (messageId) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, isPinned: !msg.isPinned };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    
    // Save to localStorage
    const savedReactions = localStorage.getItem('messageReactions');
    const reactionsMap = savedReactions ? JSON.parse(savedReactions) : {};
    
    updatedMessages.forEach(msg => {
      reactionsMap[msg.id] = {
        reactions: msg.reactions || {},
        isPinned: msg.isPinned
      };
    });
    
    localStorage.setItem('messageReactions', JSON.stringify(reactionsMap));
  };

  // Get reaction counts
  const getReactionCounts = (reactions = {}) => {
    const counts = {};
    Object.values(reactions).forEach((reaction) => {
      // Check if reaction has the expected structure
      if (reaction && typeof reaction === 'object' && reaction.emoji) {
        counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
      }
    });
    return counts;
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => {
    if (!searchQuery) return true;
    const content = msg.content.toLowerCase();
    const author = (msg.sender?.username || msg.username || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return content.includes(query) || author.includes(query);
  });

  // Get pinned messages (but keep them also in regular flow)
  const pinnedMessages = filteredMessages.filter(msg => msg.isPinned);
  const regularMessages = filteredMessages;

  // Render message content with highlighted mentions
  const renderMessageContent = (content) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="mention-highlight">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Get filtered mention suggestions
  const mentionSuggestions = teamMembers.filter(member =>
    member.username.toLowerCase().includes(mentionSearch.toLowerCase())
  ).slice(0, 5);

  // Handler for converting message to task
  const openTaskModal = (content) => {
    setTaskInitialData({
        title: "New Task from Chat",
        description: `Source: Chat Message\n\n"${content}"`,
        teamId: selectedTeamId
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (taskData) => {
    const newTask = { 
        ...taskData, 
        assignedTo: user.username,
        userAllowedIds: [user.id],
        teamId: selectedTeamId
    };
    await createTask(newTask);
    console.log("Task created from chat");
  };

  return (
    <div className={`messages-container ${darkMode ? 'dark' : ''}`}>
      
      {/* Header with Search */}
      <div className={`messages-header ${darkMode ? 'dark' : ''}`}>
        <div className="flex flex-col items-center gap-2">
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>To:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Team Chat</span>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-md mt-2">
              <input
                type="text"
                placeholder="🔍 Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg text-sm border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
        </div>
        <div className="mt-2 flex justify-center">
          <label className={`mr-2 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Team:</label>
          <select
            className={`px-3 py-2 rounded-lg border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"}`}
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Zone */}
      <div 
        ref={messagesZoneRef}
        onScroll={handleScroll}
        className={`messages-zone ${darkMode ? 'dark' : ''}`}
      >
        {filteredMessages.length === 0 && (
            <div className={`text-center mt-10 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery ? 'No messages found' : 'No messages yet. Start the conversation!'}
            </div>
        )}
        
        {/* Pinned Messages Section */}
        {pinnedMessages.length > 0 && (
          <div className={`pinned-messages-section ${darkMode ? 'dark' : ''}`}>
            <div className={`pinned-header ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📌 Pinned Messages
            </div>
            {pinnedMessages.map((msg) => {
              const isMe = msg.senderId === user.id;
              const author =
                (msg.sender && (msg.sender.username || msg.sender.email)) ||
                msg.username ||
                msg.email ||
                msg.senderId ||
                "User";
              const reactionCounts = getReactionCounts(msg.reactions);

              return (
                <div key={`pinned-${msg.id}`} className={`pinned-message-compact ${isMe ? 'sent' : 'received'}`}>
                  <span className={`author-name ${isMe ? 'sent' : darkMode ? 'dark' : ''}`}>
                    {author}
                  </span>
                  <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'} ${darkMode ? 'dark' : ''}`}>
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Regular Messages */}
        {regularMessages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const author =
            (msg.sender && (msg.sender.username || msg.sender.email)) ||
            msg.username ||
            msg.email ||
            msg.senderId ||
            "User";
          const reactionCounts = getReactionCounts(msg.reactions);

          return (
            <div key={msg.id} className={`message-wrapper ${isMe ? 'sent' : 'received'}`}>
              <span className={`author-name ${isMe ? 'sent' : darkMode ? 'dark' : ''}`}>
                {author}
              </span>
              <div className="message-content-wrapper">
                <div className={`message-actions ${isMe ? 'sent' : 'received'}`}>
                  <button onClick={() => togglePin(msg.id)} title="Pin message" className="action-btn">
                    📌
                  </button>
                  <button onClick={() => openTaskModal(msg.content)} title="Convert to task" className="action-btn">
                    📋
                  </button>
                </div>
                <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'} ${darkMode ? 'dark' : ''}`}>
                  {renderMessageContent(msg.content)}
                </div>
                {/* Reaction Picker - Inside content wrapper, beside message */}
                <div className="reaction-picker-container">
                <div className="reaction-picker">
                  {['👍', '❤️', '😂', '🎉', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className="reaction-btn"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
              
            {/* Reactions Display - Below everything */}
            {Object.keys(reactionCounts).length > 0 && (
                <div className="reactions-display-external">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(msg.id, emoji)}
                      className={`reaction-badge ${msg.reactions?.[`${user.id}_${emoji}`] ? 'active' : ''}`}
                    >
                      {emoji} {count}
                    </button>
                  ))}
                </div>
              )}
              
              <span className={`message-time ${darkMode ? 'dark' : ''}`}>
                 {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Zone with Mention Suggestions */}
      <div className={`messages-input-zone ${darkMode ? 'dark' : ''}`}>
        {/* Mention Suggestions Dropdown */}
        {showMentionSuggestions && mentionSuggestions.length > 0 && (
          <div className={`mention-suggestions ${darkMode ? 'dark' : ''}`}>
            {mentionSuggestions.map(member => (
              <button
                key={member.id}
                onClick={() => selectMention(member.username)}
                className={`mention-item ${darkMode ? 'dark' : ''}`}
              >
                <span className="mention-username">@{member.username}</span>
                <span className="mention-email">{member.email}</span>
              </button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className={`w-full border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-4 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Message... (use @ to mention)"
              value={text}
              onChange={handleInputChange}
              disabled={!selectedTeamId}
            />
          </div>
          <button 
            type="submit" 
            disabled={!text.trim() || !selectedTeamId}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-gray-400"
          >
            <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={handleCreateTask}
        initialData={{ ...taskInitialData, teamId: selectedTeamId }}
      />
    </div>
  );
}
