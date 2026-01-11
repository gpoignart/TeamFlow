// Notification Service
// Manages notifications for tasks, messages, and deadlines

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  NEW_MESSAGE: 'new_message',
  DEADLINE_NEAR: 'deadline_near',
  TEAM_INVITE: 'team_invite'
};

// Get all notifications for current user
export const getNotifications = () => {
  const notifications = localStorage.getItem('notifications');
  return notifications ? JSON.parse(notifications) : [];
};

// Add a new notification
export const addNotification = (notification) => {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now(),
    ...notification,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(newNotification);
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  localStorage.setItem('notifications', JSON.stringify(notifications));
  return newNotification;
};

// Mark notification as read
export const markAsRead = (notificationId) => {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  localStorage.setItem('notifications', JSON.stringify(updated));
  return updated;
};

// Mark all as read
export const markAllAsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem('notifications', JSON.stringify(updated));
  return updated;
};

// Delete notification
export const deleteNotification = (notificationId) => {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem('notifications', JSON.stringify(filtered));
  return filtered;
};

// Clear all notifications
export const clearAllNotifications = () => {
  localStorage.setItem('notifications', JSON.stringify([]));
  return [];
};

// Get unread count
export const getUnreadCount = () => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

// Check for upcoming deadlines (tasks due in next 3 days)
export const checkDeadlines = (tasks, userId) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const notifications = [];
  
  tasks.forEach(task => {
    if (!task.dueDate || task.status === 'done') return;
    
    const dueDate = new Date(task.dueDate);
    if (dueDate > now && dueDate <= threeDaysFromNow) {
      // Check if notification already exists
      const existingNotifs = getNotifications();
      const alreadyNotified = existingNotifs.some(
        n => n.type === NOTIFICATION_TYPES.DEADLINE_NEAR && 
             n.taskId === task.id &&
             new Date(n.createdAt) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );
      
      if (!alreadyNotified) {
        const daysLeft = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
        addNotification({
          type: NOTIFICATION_TYPES.DEADLINE_NEAR,
          title: '⚠️ Deadline approaching!',
          message: `Task "${task.title}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
          taskId: task.id,
          userId: userId
        });
      }
    }
  });
  
  return notifications;
};
