import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, createTask } from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import '../styles/messages.css';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  
  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskInitialData, setTaskInitialData] = useState({});

  const bottomRef = useRef(null);
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
  }, []);

  const fetchChat = async () => {
    if (!selectedTeamId) return;
    try {
      const data = await getMessages(selectedTeamId);
      setMessages(data.reverse()); 
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [selectedTeamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedTeamId) return;
    await sendMessage(text, selectedTeamId);
    setText('');
    fetchChat();
  };

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
      
      {/* Header */}
      <div className={`messages-header ${darkMode ? 'dark' : ''}`}>
        <div className="flex flex-col items-center">
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>To:</span>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Team Chat</span>
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
      <div className={`messages-zone ${darkMode ? 'dark' : ''}`}>
        {messages.length === 0 && (
            <div className={`text-center mt-10 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                No messages yet. Start the conversation!
            </div>
        )}
        
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user.id;
          // Try to display username, then email, then senderId
          const author =
            (msg.sender && (msg.sender.username || msg.sender.email)) ||
            msg.username ||
            msg.email ||
            msg.senderId ||
            "User";

          return (
            <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Author Name */}
                <span className={`text-[11px] font-semibold mb-1 ${isMe ? 'text-blue-400' : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {author}
                </span>
                {/* Bubble Container with Group Hover for Actions */}
                <div className="flex items-center gap-2 max-w-[85%]">
                    {/* Action Button (appears on hover) */}
                    <button 
                        onClick={() => openTaskModal(msg.content)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full text-gray-500 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 hover:text-blue-400' 
                            : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-600'
                        } ${isMe ? 'order-first' : 'order-last'}`}
                        title="Convert to Task"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </button>
                    <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'} ${darkMode ? 'dark' : ''}`}>
                        {msg.content}
                    </div>
                </div>
                {/* Time (Hidden by default) */}
                <span className={`text-[9px] px-2 opacity-0 hover:opacity-100 transition-opacity ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                   {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Zone */}
      <div className={`messages-input-zone ${darkMode ? 'dark' : ''}`}>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              className={`w-full border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pl-4 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
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