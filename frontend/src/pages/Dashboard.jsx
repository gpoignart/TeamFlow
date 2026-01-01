import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, messages: 0 });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    getStats().then(setStats).catch(console.error);
  }, []);

  const Card = ({ title, count, link, color, icon }) => (
    <Link to={link} className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-200 group relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/10 rounded-full group-hover:bg-${color}-500/20 transition-colors`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${color}-50 text-${color}-600`}>
          ACTIVE
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{count}</h3>
      </div>
    </Link>
  );

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Welcome back, {user?.username || 'Team Member'}!</h1>
        <p className="text-gray-500">Here's what's happening in your workspace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Pending Tasks" count={stats.tasks} link="/tasks" color="blue" icon={<span className="text-xl">✅</span>} />
        <Card title="Team Members" count={stats.users} link="/users" color="indigo" icon={<span className="text-xl">👥</span>} />
        <Card title="New Messages" count={stats.messages} link="/messages" color="emerald" icon={<span className="text-xl">💬</span>} />
      </div>
    </div>
  );
}