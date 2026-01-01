import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Users from "./pages/Users.jsx";
import Messages from "./pages/Messages.jsx";
import "./styles/global.css";

const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || '{}');
const isAuthenticated = () => !!getToken();

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// Icons
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="10" fill="#3b82f6"/>
    <path d="M10 10h12v4h-8v4h8v4h-12v-12z" fill="white"/>
  </svg>
);

function AppLayout({ children }) {
  const location = useLocation();
  const auth = isAuthenticated();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const NavLink = ({ to, label, icon }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
          active
            ? "bg-blue-100 text-blue-700 shadow-sm"
            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
        }`}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {auth && location.pathname !== "/login" && (
        <header className="glass-header">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <LogoIcon />
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-none">TeamFlow</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Workspace</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/60">
              <NavLink to="/" label="Overview" icon={<span className="text-lg">📊</span>} />
              <NavLink to="/tasks" label="Tasks" icon={<span className="text-lg">✅</span>} />
              <NavLink to="/users" label="Team" icon={<span className="text-lg">👥</span>} />
              <NavLink to="/messages" label="Chat" icon={<span className="text-lg">💬</span>} />
            </nav>

            {/* Profile */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user.username || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role || 'Member'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 flex items-center justify-center text-gray-600 hover:text-red-600 transition-colors border border-gray-200"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />} />
      </Routes>
    </AppLayout>
  );

}
