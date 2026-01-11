import React, { useState, useEffect, useRef } from 'react';

export default function PomodoroTimer() {
  const [darkMode, setDarkMode] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('preferences');
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
  }, []);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            playSound();
            if (isBreak) {
              // Break finished, start work session
              setMinutes(25);
              setIsBreak(false);
              setIsActive(false);
            } else {
              // Work session finished, start break
              setSessions(prev => prev + 1);
              const nextBreak = (sessions + 1) % 4 === 0 ? 15 : 5; // Long break every 4 sessions
              setMinutes(nextBreak);
              setIsBreak(true);
              setIsActive(false);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, sessions]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: isBreak ? 'Break finished! Time to work.' : 'Work session finished! Take a break.',
        icon: '/favicon.ico'
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(isBreak ? 5 : 25);
    setSeconds(0);
  };

  const skipSession = () => {
    setIsActive(false);
    if (isBreak) {
      setMinutes(25);
      setIsBreak(false);
    } else {
      setSessions(prev => prev + 1);
      const nextBreak = sessions % 4 === 0 ? 15 : 5;
      setMinutes(nextBreak);
      setIsBreak(true);
    }
    setSeconds(0);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className={`pomodoro-container ${darkMode ? 'dark' : ''}`}>
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwoSVrLp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7OGZSwo=" />
      
      <div className="timer-header">
        <h3 className="timer-title">
          {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
        </h3>
        <div className="sessions-count">
          Sessions: {sessions}
        </div>
      </div>

      <div className="timer-display">
        <svg className="progress-ring" width="280" height="280">
          <circle
            className="progress-ring-bg"
            cx="140"
            cy="140"
            r="120"
          />
          <circle
            className={`progress-ring-progress ${isBreak ? 'break' : 'work'}`}
            cx="140"
            cy="140"
            r="120"
            style={{
              strokeDashoffset: 754 - (754 * progress) / 100
            }}
          />
        </svg>
        
        <div className="time-text">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <div className="timer-controls">
        <button
          onClick={toggleTimer}
          className={`control-btn primary ${isActive ? 'active' : ''}`}
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        <button
          onClick={resetTimer}
          className="control-btn secondary"
        >
          🔄 Reset
        </button>
        <button
          onClick={skipSession}
          className="control-btn secondary"
        >
          ⏭️ Skip
        </button>
      </div>

      <div className="timer-info">
        <div className="info-box">
          <span className="info-label">Work:</span>
          <span className="info-value">25 min</span>
        </div>
        <div className="info-box">
          <span className="info-label">Short Break:</span>
          <span className="info-value">5 min</span>
        </div>
        <div className="info-box">
          <span className="info-label">Long Break:</span>
          <span className="info-value">15 min</span>
        </div>
      </div>
    </div>
  );
}
