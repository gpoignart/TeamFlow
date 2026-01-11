import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Users from "./pages/Users.jsx";
import Messages from "./pages/Messages.jsx";
import Settings from "./pages/Settings.jsx";
import Team from "./pages/Team.jsx";
import TeamCreation from "./pages/TeamCreation.jsx";
import TimeManagement from "./pages/TimeManagement.jsx";
import Profile from "./pages/Profile.jsx";
import NotificationPanel from "./components/NotificationPanel.jsx";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from "./services/notificationService.js";
import "./styles/global.css";

// --- Auth Utilities ---
const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || '{}');
const isAuthenticated = () => !!getToken();

// --- Premium Navbar Component ---
function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Load user profile data on mount
  useEffect(() => {
    const currentUser = getUser();
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}');
    if (userProfiles[currentUser.id]) {
      const enrichedUser = { ...currentUser, ...userProfiles[currentUser.id] };
      setUser(enrichedUser);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShowUserMenu(false);
  }, [location]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(getNotifications());
      setUnreadCount(getUnreadCount());
    };
    
    loadNotifications();
    // Refresh notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      setUser(event.detail);
    };
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const handleMarkAsRead = (notifId) => {
    markAsRead(notifId);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleDeleteNotification = (notifId) => {
    deleteNotification(notifId);
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊", desc: "Overview & analytics" },
    { path: "/tasks", label: "Tasks", icon: "✅", desc: "Manage your work" },
    { path: "/time-management", label: "Time", icon: "⏰", desc: "Calendar & Pomodoro" },
    { path: "/team", label: "My Teams", icon: "👫", desc: "Create & manage teams" },
    { path: "/users", label: "Members", icon: "👥", desc: "Team members" },
    { path: "/messages", label: "Chat", icon: "💬", desc: "Team conversations" }
  ];

  return (
    <>
      {/* Premium Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-2xl shadow-2xl shadow-slate-900/8 border-b border-slate-200/50 py-2.5" 
          : "bg-white/60 backdrop-blur-3xl border-b border-slate-200/30 py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Section - Enhanced */}
            <a href="/" className="flex items-center gap-3 shrink-0 group cursor-pointer relative">
              {/* Animated gradient background */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-xl shadow-blue-500/30 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-12 transition-transform duration-300">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              
              <div className="relative hidden sm:block">
                <h1 className="font-bold text-slate-900 text-lg tracking-tight">TeamFlow</h1>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Workspace</span>
              </div>
            </a>

            {/* Desktop Navigation - Premium Style */}
            <div className="hidden lg:flex items-center gap-2 mx-8">
              <div className="flex items-center gap-1 bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-full border border-slate-200/60 shadow-lg shadow-slate-900/5">
                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`relative px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 group ${
                        isActive
                          ? "text-blue-600 bg-white shadow-lg shadow-blue-500/20"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {/* Animated background glow on hover */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur`} />
                      
                      <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <span className="relative">{item.label}</span>
                      
                      {isActive && (
                        <span className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications Button - NEW */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative group flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 hover:text-blue-600 hover:from-blue-50 hover:to-slate-50 transition-all duration-300 border border-slate-200/60 shadow-sm"
                >
                  <span className="text-lg">🔔</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDelete={handleDeleteNotification}
                    onClose={() => setShowNotifications(false)}
                    darkMode={false}
                  />
                )}
              </div>

              {/* Desktop User Profile - Premium */}
              <div className={`hidden lg:flex items-center gap-3 pr-4 transition-all duration-300 ${scrolled ? 'opacity-60' : 'opacity-100'}`}>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 tracking-tight">{user.username || 'User'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">{user.role || 'Member'}</p>
                </div>
              </div>

              {/* Avatar with Dropdown Menu */}
              <div className="hidden lg:block relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative group flex items-center gap-0.5 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/40 hover:scale-110 transition-all duration-300 border border-blue-400/50"
                >
                  {(user.username || 'U').charAt(0).toUpperCase()}
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="text-lg">👤</span>
                      <span>Profile</span>
                    </a>
                    <a
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-slate-700 hover:text-blue-600 font-medium"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="text-lg">⚙️</span>
                      <span>Settings</span>
                    </a>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 font-medium"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button - Premium */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden relative w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600 hover:text-blue-600 hover:from-blue-50 hover:to-slate-50 transition-all duration-300 border border-slate-200/60 shadow-sm"
              >
                <svg className="w-5 h-5 mx-auto transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Premium */}
          {mobileOpen && (
            <div className="lg:hidden mt-4 pt-4 pb-2 border-t border-slate-200/60 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col gap-1 mb-4">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 relative group ${
                        isActive
                          ? "text-blue-600 bg-blue-50 shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </span>
                      <div>
                        <div>{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                      {isActive && (
                        <div className="absolute right-4 w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </a>
                  );
                })}
              </div>

              {/* Mobile Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3" />

              {/* Mobile Actions */}
              <div className="flex flex-col gap-2">
                <a 
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-300 text-sm font-semibold"
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 text-sm font-semibold"
                >
                  <span>🚪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Decorative line under navbar */}
      <div className="fixed top-[3.5rem] sm:top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none z-40" />
    </>
  );
}

// --- Main App ---
export default function App() {
  const location = useLocation();
  const auth = isAuthenticated();
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference on app start
  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setDarkMode(prefs.darkMode);
      applyDarkMode(prefs.darkMode);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }

    // Listen for storage changes (when preferences are updated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "preferences") {
        const newPrefs = JSON.parse(e.newValue);
        setDarkMode(newPrefs.darkMode);
        applyDarkMode(newPrefs.darkMode);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  };

  // Show login without navbar
  if (!auth || location.pathname === "/login") {
    return (
      <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  // Show navbar + content for authenticated users
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100'
    }`}>
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/time-management" element={<TimeManagement />} />
            <Route path="/team" element={<Team />} />
            <Route path="/users" element={<Users />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/team/create" element={<TeamCreation />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
