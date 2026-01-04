import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStats, getTasks, getMessages } from "../services/api";

function SkeletonCard({ darkMode }) {
  return (
    <div className={`glass-panel p-6 animate-pulse ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <div className={`h-10 w-10 rounded-2xl mb-4 ${darkMode ? 'bg-gray-700/70' : 'bg-gray-200/70'}`} />
      <div className={`h-4 w-24 rounded mb-2 ${darkMode ? 'bg-gray-700/70' : 'bg-gray-200/70'}`} />
      <div className={`h-8 w-16 rounded ${darkMode ? 'bg-gray-700/70' : 'bg-gray-200/70'}`} />
    </div>
  );
}

function StatCard({ title, value, subtitle, to, accent, icon, delay, darkMode }) {
  const accentStyles = {
    blue: darkMode ? "bg-blue-900/30 text-blue-400 ring-blue-900 hover:ring-blue-800" : "bg-blue-50 text-blue-600 ring-blue-100 hover:ring-blue-300",
    indigo: darkMode ? "bg-indigo-900/30 text-indigo-400 ring-indigo-900 hover:ring-indigo-800" : "bg-indigo-50 text-indigo-600 ring-indigo-100 hover:ring-indigo-300",
    emerald: darkMode ? "bg-emerald-900/30 text-emerald-400 ring-emerald-900 hover:ring-emerald-800" : "bg-emerald-50 text-emerald-600 ring-emerald-100 hover:ring-emerald-300",
    purple: darkMode ? "bg-purple-900/30 text-purple-400 ring-purple-900 hover:ring-purple-800" : "bg-purple-50 text-purple-600 ring-purple-100 hover:ring-purple-300",
  };

  const style = accentStyles[accent] || accentStyles.blue;

  return (
    <Link
      to={to}
      className={`glass-panel p-6 relative overflow-hidden group interactive-card animate-slide-up ${delay} ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
            <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{title}</p>
            <h3 className={`text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
        </div>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ring-1 ${style} group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, messages: 0 });
  const [taskData, setTaskData] = useState({ total: 0, done: 0, percent: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }

    // Load teams for filtering tasks/messages
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    let userTeams = [];
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      userTeams = allTeams.filter(
        t => t.owner === userObj.id || (t.members || []).some(m => m.email === userObj.email)
      );
      setTeams(userTeams);
    }

    const fetchData = async () => {
      try {
        const [statsRes, tasksRes, messagesRes, usersRes] = await Promise.all([
          getStats(),
          getTasks(),
          // Get all messages for all teams the user is in
          Promise.all(
            (userTeams.length > 0 && storedUser)
              ? userTeams.map(team => getMessages(team.id))
              : []
          ),
          // Fetch all users for member count
          import("../services/api").then(api => api.getUsers())
        ]);

        // Calculate unique team members for the user's teams
        let memberSet = new Set();
        userTeams.forEach(team => {
          memberSet.add(String(team.owner));
          (team.members || []).forEach(m => {
            // Find user by email to get their id
            if (usersRes && Array.isArray(usersRes)) {
              const userObj = usersRes.find(u => u.email === m.email);
              if (userObj) memberSet.add(String(userObj.id));
            }
          });
        });

        setStats({
          users: memberSet.size,
          tasks: 0, // will be set below
          messages: 0, // will be set below
        });

        // Only count tasks for user's teams
        if (Array.isArray(tasksRes) && storedUser) {
          const teamIds = userTeams.map(t => String(t.id));
          const filteredTasks = tasksRes.filter(t => teamIds.includes(String(t.teamId)));
          const doneCount = filteredTasks.filter(t => t.status === 'done').length;
          const totalCount = filteredTasks.length;
          setStats(s => ({ ...s, tasks: totalCount }));
          setTaskData({
            total: totalCount,
            done: doneCount,
            percent: totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0
          });
        }

        // Count messages for user's teams
        if (messagesRes && Array.isArray(messagesRes)) {
          // messagesRes is an array of arrays (one per team)
          const allMsgs = messagesRes.flat();
          setStats(s => ({ ...s, messages: allMsgs.length }));
        }

      } catch (e) {
        console.error("Dashboard Load Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, []);

  return (
    <div className="page-container space-y-8">
      
      {/* Hero Section */}
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up delay-0`}>
        <div>
          <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {greeting}, <span className="text-gradient">{user?.username || "Guest"}</span>
          </h1>
          <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Here's what's happening with your team today.
          </p>
        </div>
        <div className={`glass-panel px-4 py-2 flex items-center gap-2 text-sm font-medium ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white text-gray-600'}`}>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          System Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
           Array(4).fill(0).map((_, i) => <SkeletonCard key={i} darkMode={darkMode} />)
        ) : (
          <>
            <StatCard 
                title="Active Tasks" 
                value={stats.tasks} 
                subtitle="In the pipeline" 
                icon="⚡" 
                accent="blue" 
                to="/tasks" 
                delay="delay-100"
                darkMode={darkMode}
            />
            <StatCard 
                title="Team Members" 
                value={stats.users} 
                subtitle="Active contributors" 
                icon="👥" 
                accent="indigo" 
                to="/users" 
                delay="delay-200"
                darkMode={darkMode}
            />
            <StatCard 
                title="Messages" 
                value={stats.messages} 
                subtitle="Team discussions" 
                icon="💬" 
                accent="emerald" 
                to="/messages" 
                delay="delay-300"
                darkMode={darkMode}
            />
             
            <div className={`glass-panel p-6 animate-slide-up delay-300 flex flex-col justify-between relative overflow-hidden group ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <div>
                    <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Completion Rate</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{taskData.percent}%</h3>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>of tasks done</span>
                    </div>
                </div>
                
                <div className={`mt-4 w-full rounded-full h-3 overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${taskData.percent}%` }} 
                    />
                </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up delay-300`}>
        
        <div className="lg:col-span-2 space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                🚀 Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/tasks" className={`group p-4 border rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        +
                    </div>
                    <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>New Task</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create a work item</div>
                    </div>
                </Link>
                
                <Link to="/messages" className={`group p-4 border rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        ✉️
                    </div>
                    <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Send Message</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chat with team</div>
                    </div>
                </Link>
            </div>
        </div>

        <div className={`glass-panel p-6 flex flex-col justify-center items-center text-center space-y-3 ${darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-gradient-to-br from-white to-blue-50/50'}`}>
            <span className="text-4xl">🎯</span>
            <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Keep it flowing!</p>
                <p className={`text-xs mt-1 max-w-[200px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    "Productivity is never an accident. It is always the result of a commitment to excellence."
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}