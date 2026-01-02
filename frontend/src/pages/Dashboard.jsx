import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../services/api";

function SkeletonCard() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-2xl bg-gray-200/70" />
        <div className="h-6 w-14 rounded-full bg-gray-200/70" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-3 w-24 rounded bg-gray-200/70" />
        <div className="h-8 w-20 rounded bg-gray-200/70" />
        <div className="h-3 w-40 rounded bg-gray-200/70" />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, to, accent, icon }) {
  const accentMap = {
    blue: {
      ring: "ring-blue-200/60",
      bg: "bg-blue-50",
      text: "text-blue-700",
      blob: "bg-blue-500/10",
      glow: "group-hover:shadow-blue-200/40",
    },
    indigo: {
      ring: "ring-indigo-200/60",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      blob: "bg-indigo-500/10",
      glow: "group-hover:shadow-indigo-200/40",
    },
    emerald: {
      ring: "ring-emerald-200/60",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      blob: "bg-emerald-500/10",
      glow: "group-hover:shadow-emerald-200/40",
    },
  };

  const a = accentMap[accent] ?? accentMap.blue;

  return (
    <Link
      to={to}
      className={`glass-panel p-6 group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${a.glow}`}
      aria-label={`${title}: ${value}`}
    >
      {/* soft blob */}
      <div className={`absolute -right-8 -top-10 h-28 w-28 rounded-full ${a.blob} blur-[1px]`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`h-10 w-10 rounded-2xl ${a.bg} ${a.text} flex items-center justify-center ring-1 ${a.ring}`}>
            <span className="text-lg">{icon}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Live
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-4xl font-semibold text-gray-900 tabular-nums">{value}</h3>
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Tap to manage {title.toLowerCase()}.
          </p>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-gray-200/60 hover:bg-white/80 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center ring-1 ring-gray-200/60">
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <span className="text-gray-400 group-hover:text-gray-700 transition-colors">→</span>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, messages: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    (async () => {
      try {
        const data = await getStats();
        setStats({
          users: Number(data?.users ?? 0),
          tasks: Number(data?.tasks ?? 0),
          messages: Number(data?.messages ?? 0),
        });
      } catch (e) {
        setErrorMsg(e?.message || "Failed to load dashboard stats.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Overview
          </p>
          <h1 className="page-title">
            {greeting}, {user?.username || "Team Member"}.
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            A quick snapshot of what matters right now.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/60 px-3 py-2 text-xs font-semibold text-gray-600 ring-1 ring-gray-200/60">
            Updated just now
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200/60">
          {errorMsg}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Tasks"
              value={stats.tasks}
              subtitle="pending"
              to="/tasks"
              accent="blue"
              icon="✅"
            />
            <StatCard
              title="Team"
              value={stats.users}
              subtitle="members"
              to="/users"
              accent="indigo"
              icon="👥"
            />
            <StatCard
              title="Messages"
              value={stats.messages}
              subtitle="new"
              to="/messages"
              accent="emerald"
              icon="💬"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Quick actions</h2>
          <p className="text-xs text-gray-500">Less friction, more flow.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <QuickAction
            to="/tasks"
            title="Create a task"
            description="Capture work in seconds"
            icon="＋"
          />
          <QuickAction
            to="/messages"
            title="Open chat"
            description="Check latest updates"
            icon="✉️"
          />
          <QuickAction
            to="/users"
            title="View team"
            description="See roles and members"
            icon="🧑‍🤝‍🧑"
          />
        </div>
      </div>
    </div>
  );
}
