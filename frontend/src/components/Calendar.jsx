import React, { useState, useEffect } from 'react';

export default function Calendar({ tasks, onTaskClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTasksForDay = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // Create date string directly without timezone conversion
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      // Compare dates as strings directly to avoid timezone issues
      const taskDateStr = String(task.dueDate).split('T')[0];
      return taskDateStr === dateStr;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDay(day);
    const hasUrgent = dayTasks.some(t => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dateStr = String(t.dueDate).split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      const daysUntil = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 3 && daysUntil >= 0;
    });
    const hasOverdue = dayTasks.some(t => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dateStr = String(t.dueDate).split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      return due < now;
    });

    days.push(
      <div
        key={day}
        className={`calendar-day ${isToday(day) ? 'today' : ''} ${darkMode ? 'dark' : ''} ${
          dayTasks.length > 0 ? 'has-tasks' : ''
        }`}
      >
        <div className="day-number">{day}</div>
        {dayTasks.length > 0 && (
          <div className="tasks-indicator">
            <div className={`task-count ${hasOverdue ? 'overdue' : hasUrgent ? 'urgent' : 'normal'}`}>
              {dayTasks.length}
            </div>
            <div className="tasks-preview">
              {dayTasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`task-pill ${task.priority}`}
                  onClick={() => onTaskClick && onTaskClick(task)}
                  title={task.title}
                >
                  {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="more-tasks">+{dayTasks.length - 3} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`calendar-container ${darkMode ? 'dark' : ''}`}>
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">
          ◀️
        </button>
        <h2 className="month-year">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="nav-btn">
          ▶️
        </button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
}
