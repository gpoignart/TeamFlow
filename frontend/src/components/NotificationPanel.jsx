import React from 'react';

export default function NotificationPanel({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onClose, darkMode }) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'task_assigned':
        return '📋';
      case 'task_completed':
        return '✅';
      case 'new_message':
        return '💬';
      case 'deadline_near':
        return '⏰';
      case 'team_invite':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`absolute right-0 top-full mt-2 w-96 max-h-[80vh] rounded-xl shadow-2xl border overflow-hidden z-50 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className={`text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            ×
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
        {notifications.length === 0 ? (
          <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="text-4xl mb-2">🔔</div>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-4 border-b transition-all ${
                notif.read
                  ? darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  : darkMode ? 'bg-blue-900/20 border-gray-700' : 'bg-blue-50/50 border-blue-100'
              } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <div className="flex gap-3">
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatTime(notif.createdAt)}
                    </span>
                    <div className="flex gap-2">
                      {!notif.read && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${
                            darkMode
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(notif.id)}
                        className={`text-[10px] px-2 py-1 rounded font-semibold transition-all ${
                          darkMode
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
