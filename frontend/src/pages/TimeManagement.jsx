import React, { useState, useEffect } from 'react';
import Calendar from '../components/Calendar';
import PomodoroTimer from '../components/PomodoroTimer';
import { getTasks } from '../services/api';
import '../styles/timeManagement.css';

export default function TimeManagement() {
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [deadlineFilter, setDeadlineFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    loadTasks();
    
    // Écouter les événements de changement de team pour recharger les tasks
    const handleTeamChange = () => {
      console.log('Team change detected, reloading tasks...');
      loadTasks();
    };
    
    window.addEventListener('teamUpdated', handleTeamChange);
    window.addEventListener('teamJoined', handleTeamChange);
    window.addEventListener('teamCreated', handleTeamChange);
    window.addEventListener('teamDeleted', handleTeamChange);
    window.addEventListener('taskDeleted', handleTeamChange);
    window.addEventListener('taskUpdated', handleTeamChange);
    window.addEventListener('taskCreated', handleTeamChange);
    
    return () => {
      window.removeEventListener('teamUpdated', handleTeamChange);
      window.removeEventListener('teamJoined', handleTeamChange);
      window.removeEventListener('teamCreated', handleTeamChange);
      window.removeEventListener('teamDeleted', handleTeamChange);
      window.removeEventListener('taskDeleted', handleTeamChange);
      window.removeEventListener('taskUpdated', handleTeamChange);
      window.removeEventListener('taskCreated', handleTeamChange);
    };
  }, []);

  useEffect(() => {
    filterTasksByDeadline();
  }, [tasks, deadlineFilter]);

  const loadTasks = async () => {
    try {
      // Try to get tasks from API - backend already filters by user's teams
      let allTasks = [];
      try {
        const data = await getTasks();
        console.log('Tasks loaded from API:', data);
        allTasks = Array.isArray(data) ? data : [];
      } catch (apiError) {
        console.error('Error loading tasks from API:', apiError);
        // Fallback to localStorage if API fails
        const user = JSON.parse(localStorage.getItem('user'));
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          const tasks = JSON.parse(storedTasks);
          // Filter by userAllowedIds when using localStorage
          allTasks = tasks.filter(task => 
            Array.isArray(task.userAllowedIds) && 
            task.userAllowedIds.some(id => String(id) === String(user.id))
          );
        }
      }
      
      // Only keep tasks with due dates for this page
      const tasksWithDates = allTasks.filter(t => t.dueDate);
      console.log('Tasks with dates for calendar:', tasksWithDates);
      setTasks(tasksWithDates);
    } catch (e) {
      console.error('Error loading tasks:', e);
    }
  };

  const filterTasksByDeadline = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let filtered = [...tasks];

    switch (deadlineFilter) {
      case 'today':
        filtered = tasks.filter(task => {
          const dateStr = String(task.dueDate).split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate.getTime() === now.getTime();
        });
        break;
      
      case 'week':
        const weekFromNow = new Date(now);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filtered = tasks.filter(task => {
          const dateStr = String(task.dueDate).split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate >= now && dueDate <= weekFromNow;
        });
        break;
      
      case 'month':
        const monthFromNow = new Date(now);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        filtered = tasks.filter(task => {
          const dateStr = String(task.dueDate).split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate >= now && dueDate <= monthFromNow;
        });
        break;
      
      case 'overdue':
        filtered = tasks.filter(task => {
          const dateStr = String(task.dueDate).split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate < now;
        });
        break;
      
      case 'urgent':
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        filtered = tasks.filter(task => {
          const dateStr = String(task.dueDate).split('T')[0];
          const [year, month, day] = dateStr.split('-').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate >= now && dueDate <= threeDaysFromNow;
        });
        break;
      
      default:
        filtered = tasks;
    }

    setFilteredTasks(filtered);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'green';
      case 'in-progress':
        return 'yellow';
      default:
        return 'red';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      default:
        return '🟢';
    }
  };

  return (
    <div className={`time-management-page ${darkMode ? 'dark' : ''}`}>
      <div className="time-header">
        <h1 className="time-title">⏰ Time Management</h1>
        <p className="time-subtitle">Manage your tasks and stay productive</p>
      </div>

      <div className="time-content">
        {/* Left Column: Calendar & Filters */}
        <div className="left-column">
          <div className="section calendar-section">
            <h2 className="section-title">📅 Task Calendar</h2>
            <Calendar tasks={tasks} onTaskClick={handleTaskClick} />
          </div>

          <div className="section filter-section">
            <h2 className="section-title">🔍 Filter by Deadline</h2>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${deadlineFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('all')}
              >
                📋 All ({tasks.length})
              </button>
              <button
                className={`filter-btn ${deadlineFilter === 'today' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('today')}
              >
                📍 Today
              </button>
              <button
                className={`filter-btn ${deadlineFilter === 'week' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('week')}
              >
                📆 This Week
              </button>
              <button
                className={`filter-btn ${deadlineFilter === 'month' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('month')}
              >
                🗓️ This Month
              </button>
              <button
                className={`filter-btn urgent ${deadlineFilter === 'urgent' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('urgent')}
              >
                ⚠️ Urgent (≤3 days)
              </button>
              <button
                className={`filter-btn overdue ${deadlineFilter === 'overdue' ? 'active' : ''}`}
                onClick={() => setDeadlineFilter('overdue')}
              >
                🚨 Overdue
              </button>
            </div>

            <div className="filtered-tasks-list">
              <h3 className="list-title">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </h3>
              {filteredTasks.length === 0 ? (
                <p className="no-tasks">No tasks for this filter</p>
              ) : (
                <div className="tasks-grid">
                  {filteredTasks.map(task => {
                    const daysUntil = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntil < 0;
                    const isUrgent = daysUntil >= 0 && daysUntil <= 3;

                    return (
                      <div
                        key={task.id}
                        className={`task-item ${darkMode ? 'dark' : ''} ${isOverdue ? 'overdue' : isUrgent ? 'urgent' : ''}`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="task-header-row">
                          <span className="priority-icon">{getPriorityIcon(task.priority)}</span>
                          <h4 className="task-title">{task.title}</h4>
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="task-description">{task.description}</p>
                        <div className="task-footer">
                          <span className="task-date">
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <span className="deadline-badge overdue">
                              🚨 {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} overdue
                            </span>
                          )}
                          {isUrgent && !isOverdue && (
                            <span className="deadline-badge urgent">
                              ⚠️ {daysUntil} day{daysUntil !== 1 ? 's' : ''} left
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pomodoro Timer */}
        <div className="right-column">
          <div className="section timer-section">
            <h2 className="section-title">🍅 Pomodoro Timer</h2>
            <PomodoroTimer />
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className={`modal-content ${darkMode ? 'dark' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTask(null)}>✕</button>
            <h3 className="modal-title">{selectedTask.title}</h3>
            <div className="modal-body">
              <p><strong>Description:</strong> {selectedTask.description}</p>
              <p><strong>Priority:</strong> {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${getStatusColor(selectedTask.status)}`}>{selectedTask.status}</span></p>
              <p><strong>Due Date:</strong> 📅 {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
              <p><strong>Assigned to:</strong> 👤 {selectedTask.assignedTo || 'Unassigned'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
