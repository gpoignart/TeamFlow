import React, { useState, useEffect } from 'react';
import { getTasks } from '../services/api';
import { getNotifications } from '../services/notificationService';
import '../styles/profile.css';

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [darkMode, setDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    teamCount: 0,
    messagesCount: 0
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // profile, stats

  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    
    // Load saved profile data
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    if (userProfiles[user.id]) {
      const updatedUser = { ...user, ...userProfiles[user.id] };
      setUser(updatedUser);
      setEditedUser(updatedUser);
    }
    
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load tasks
      const tasks = await getTasks();
      const userTasks = tasks.filter(task => 
        task.assignedTo?.some(id => String(id) === String(user.id)) ||
        task.userAllowedIds?.some(id => String(id) === String(user.id))
      );
      
      const completed = userTasks.filter(t => t.status === 'completed').length;
      
      // Load teams
      const teams = JSON.parse(localStorage.getItem('teams') || '[]');
      const userTeams = teams.filter(t => 
        t.owner === user.id || (t.members || []).some(m => m.email === user.email)
      );
      
      // Get notifications count as activity metric
      const notifications = getNotifications();
      
      setStats({
        totalTasks: userTasks.length,
        completedTasks: completed,
        pendingTasks: userTasks.length - completed,
        teamCount: userTeams.length,
        messagesCount: notifications.filter(n => n.type === 'NEW_MESSAGE').length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadActivityHistory = () => {
    const notifications = getNotifications();
    const recentActivity = notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20)
      .map(notif => ({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        timestamp: notif.timestamp
      }));
    
    setActivityHistory(recentActivity);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...editedUser };
    
    // Save to main user object
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Save profile data separately for persistence
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    userProfiles[user.id] = {
      username: editedUser.username,
      bio: editedUser.bio,
      skills: editedUser.skills,
      avatar: editedUser.avatar
    };
    localStorage.setItem('userProfiles', JSON.stringify(userProfiles));
    
    // Emit custom event to notify other components
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: updatedUser 
    }));
    
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newSkill = e.target.value.trim();
      if (!editedUser.skills?.includes(newSkill)) {
        setEditedUser({
          ...editedUser,
          skills: [...(editedUser.skills || []), newSkill]
        });
        e.target.value = '';
      }
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setEditedUser({
      ...editedUser,
      skills: (editedUser.skills || []).filter(s => s !== skillToRemove)
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED': return '✅';
      case 'TASK_COMPLETED': return '🎉';
      case 'NEW_MESSAGE': return '💬';
      case 'MENTION': return '📢';
      case 'DEADLINE_NEAR': return '⏰';
      case 'TEAM_INVITE': return '👥';
      default: return '📌';
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className={`profile-container ${darkMode ? 'dark' : ''}`}>
      {/* Header Card */}
      <div className={`profile-header ${darkMode ? 'dark' : ''}`}>
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {editedUser.avatar ? (
              <img src={editedUser.avatar} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {(editedUser.username || editedUser.email || 'U')[0].toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label className="profile-avatar-edit">
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                📷
              </label>
            )}
          </div>
        </div>

        <div className="profile-header-info">
          {isEditing ? (
            <input
              type="text"
              value={editedUser.username || ''}
              onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
              className={`profile-input-title ${darkMode ? 'dark' : ''}`}
              placeholder="Your name"
            />
          ) : (
            <h1 className="profile-name">{user.username || user.email}</h1>
          )}
          <p className={`profile-email ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {user.email}
          </p>
          
          {!isEditing && (
            <button onClick={handleEdit} className="profile-edit-btn">
              ✏️ Edit Profile
            </button>
          )}
          
          {isEditing && (
            <div className="profile-edit-actions">
              <button onClick={handleSave} className="profile-save-btn">
                💾 Save
              </button>
              <button onClick={handleCancel} className="profile-cancel-btn">
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`profile-tabs ${darkMode ? 'dark' : ''}`}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
        >
          👤 Profile
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
        >
          📊 Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-tab-content">
            <div className={`profile-card ${darkMode ? 'dark' : ''}`}>
              <h3 className="profile-card-title">📝 Bio</h3>
              {isEditing ? (
                <textarea
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  className={`profile-textarea ${darkMode ? 'dark' : ''}`}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              ) : (
                <p className={`profile-bio ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user.bio || 'No bio yet. Click "Edit Profile" to add one!'}
                </p>
              )}
            </div>

            <div className={`profile-card ${darkMode ? 'dark' : ''}`}>
              <h3 className="profile-card-title">🎯 Skills</h3>
              {isEditing && (
                <input
                  type="text"
                  onKeyPress={handleSkillAdd}
                  className={`profile-input ${darkMode ? 'dark' : ''}`}
                  placeholder="Add a skill and press Enter"
                />
              )}
              <div className="profile-skills">
                {(isEditing ? editedUser.skills : user.skills)?.length > 0 ? (
                  (isEditing ? editedUser.skills : user.skills).map((skill, idx) => (
                    <span key={idx} className={`profile-skill-tag ${darkMode ? 'dark' : ''}`}>
                      {skill}
                      {isEditing && (
                        <button onClick={() => handleSkillRemove(skill)} className="skill-remove">
                          ✕
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                    {isEditing ? 'Add skills by typing and pressing Enter' : 'No skills added yet'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="profile-tab-content">
            <div className="profile-stats-grid">
              <div className={`profile-stat-card ${darkMode ? 'dark' : ''}`}>
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.totalTasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              
              <div className={`profile-stat-card ${darkMode ? 'dark' : ''}`}>
                <div className="stat-icon">🎉</div>
                <div className="stat-value">{stats.completedTasks}</div>
                <div className="stat-label">Completed</div>
              </div>
              
              <div className={`profile-stat-card ${darkMode ? 'dark' : ''}`}>
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingTasks}</div>
                <div className="stat-label">Pending</div>
              </div>
              
              <div className={`profile-stat-card ${darkMode ? 'dark' : ''}`}>
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.teamCount}</div>
                <div className="stat-label">Teams</div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className={`profile-card ${darkMode ? 'dark' : ''}`}>
              <h3 className="profile-card-title">📈 Completion Rate</h3>
              <div className="completion-rate-wrapper">
                <div className="completion-circle">
                  <svg viewBox="0 0 100 100" className="completion-svg">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="45" className="completion-bg" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      className="completion-fill"
                      style={{
                        strokeDasharray: `${completionRate * 2.827} 282.7`,
                      }}
                    />
                  </svg>
                  <div className="completion-text">{completionRate}%</div>
                </div>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
