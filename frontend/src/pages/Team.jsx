import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to generate a unique team code
function generateTeamCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Team() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("my-teams");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
    website: ""
  });

  const [members, setMembers] = useState([{ email: "", role: "member" }]);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createdTeamCode, setCreatedTeamCode] = useState("");

  useEffect(() => {
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      setDarkMode(JSON.parse(savedPreferences).darkMode);
    }
    loadTeams();
  }, []);

  const loadTeams = () => {
    const savedTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    setTeams(savedTeams);
  };

  const handleTeamFormChange = (e) => {
    const { name, value } = e.target;
    setTeamForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { email: "", role: "member" }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreateTeam = async () => {
    setLoading(true);
    try {
      const code = generateTeamCode();
      const newTeam = {
        id: Date.now(),
        name: teamForm.name,
        description: teamForm.description,
        industry: teamForm.industry,
        size: teamForm.size,
        website: teamForm.website,
        owner: user.id,
        members: members.filter(m => m.email),
        createdAt: new Date().toISOString(),
        code // assign unique code
      };

      const allTeams = [...teams, newTeam];
      localStorage.setItem("teams", JSON.stringify(allTeams));
      setTeams(allTeams);

      setCreatedTeamCode(code); // show code to user after creation
      setTeamForm({ name: "", description: "", industry: "", size: "", website: "" });
      setMembers([{ email: "", role: "member" }]);
      setShowCreateModal(false);
      setTimeout(() => setCreatedTeamCode(""), 10000); // hide code after 10s
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = (teamId) => {
    const filtered = teams.filter(t => t.id !== teamId);
    localStorage.setItem("teams", JSON.stringify(filtered));
    setTeams(filtered);
  };

  const handleJoinTeam = () => {
    setJoinError("");
    const allTeams = JSON.parse(localStorage.getItem("teams") || "[]");
    const found = allTeams.find(t => t.code && t.code.toUpperCase() === joinCode.trim().toUpperCase());
    if (!found) {
      setJoinError("No team found with this code.");
      return;
    }
    // Check if already a member
    if (
      found.owner === user.id ||
      (found.members || []).some(m => m.email === user.email)
    ) {
      setJoinError("You are already a member of this team.");
      return;
    }
    // Add user as member
    found.members = [...(found.members || []), { email: user.email, role: "member" }];
    // Update teams in storage
    const updatedTeams = allTeams.map(t => t.id === found.id ? found : t);
    localStorage.setItem("teams", JSON.stringify(updatedTeams));
    setTeams(updatedTeams);
    setShowJoinModal(false);
    setJoinCode("");
    setJoinError("");
  };

  const myTeams = teams.filter(t => t.owner === user.id || (t.members || []).some(m => m.email === user.email));

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up`}>
        <div>
          <h1 className={`mt-6 text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Teams
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage your workspace teams
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all animate-slide-up"
          >
            + Create Team
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all animate-slide-up"
          >
            Join Team
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 animate-slide-up delay-100">
        <button
          onClick={() => setActiveTab("my-teams")}
          className={`px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "my-teams"
              ? darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'
              : darkMode ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          My Teams ({myTeams.length})
        </button>
        <button
          onClick={() => setActiveTab("all-teams")}
          className={`px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "all-teams"
              ? darkMode ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600'
              : darkMode ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          All Teams ({teams.length})
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up delay-200">
        {(activeTab === "my-teams" ? myTeams : teams).map(team => (
          <div
            key={team.id}
            className={`rounded-xl p-6 border transition-all animate-scale-up hover:shadow-lg ${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="mb-4">
              <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {team.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {team.description || "No description"}
              </p>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              {team.industry && (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-semibold">Industry:</span> {team.industry}
                </p>
              )}
              {team.size && (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-semibold">Size:</span> {team.size}
                </p>
              )}
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-semibold">Members:</span> {team.members.length}
              </p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-semibold">Created:</span> {new Date(team.createdAt).toLocaleDateString()}
              </p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-semibold">Team Code:</span> <span className="font-mono">{team.code || "N/A"}</span>
              </p>
            </div>

            {/* Members List */}
            {team.members.length > 0 && (
              <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  MEMBERS
                </p>
                <div className="space-y-1">
                  {team.members.slice(0, 3).map((member, idx) => (
                    <p key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {member.email}
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                        member.role === 'admin'
                          ? darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                          : darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {member.role}
                      </span>
                    </p>
                  ))}
                  {team.members.length > 3 && (
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      +{team.members.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/team/${team.id}`)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                View
              </button>
              {team.owner === user.id && (
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    darkMode
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(activeTab === "my-teams" ? myTeams : teams).length === 0 && (
        <div className={`flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed ${
          darkMode
            ? 'border-gray-700 bg-gray-800/50'
            : 'border-gray-300 bg-gray-50'
        }`}>
          <span className="text-4xl mb-3">👥</span>
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {activeTab === "my-teams" ? "No teams yet" : "No teams available"}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {activeTab === "my-teams" 
              ? "Create your first team to get started" 
              : "Teams you join will appear here"}
          </p>
          {activeTab === "my-teams" && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Create Team
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
              >
                Join Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto animate-bounce-in ${
            darkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create New Team
            </h2>
            {/* Team Information */}
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Team Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={teamForm.name}
                  onChange={handleTeamFormChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300'
                  }`}
                  placeholder="e.g., Design Team"
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={teamForm.description}
                  onChange={handleTeamFormChange}
                  rows="3"
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300'
                  }`}
                  placeholder="What does your team do?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Industry
                  </label>
                  <select
                    name="industry"
                    value={teamForm.industry}
                    onChange={handleTeamFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Team Size
                  </label>
                  <select
                    name="size"
                    value={teamForm.size}
                    onChange={handleTeamFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select size</option>
                    <option value="1-5">1-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-20">11-20 people</option>
                    <option value="21+">21+ people</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Invite Members */}
            <div className="mb-6">
              <h3 className={`text-sm font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Invite Members
              </h3>
              {members.map((member, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                  />
                  <select
                    value={member.role}
                    onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  {members.length > 1 && (
                    <button
                      onClick={() => removeMember(index)}
                      className={`px-3 py-2 rounded-lg transition-all ${
                        darkMode
                          ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addMember}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all mt-2 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                + Add Member
              </button>
            </div>
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={loading || !teamForm.name}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? "Creating..." : "Create Team"}
              </button>
            </div>
            {/* Show created team code */}
            {createdTeamCode && (
              <div className="mt-6 p-4 rounded-lg bg-green-100 text-green-800 font-mono text-center border border-green-300">
                Team created! Share this code to invite others: <br />
                <span className="text-2xl font-bold">{createdTeamCode}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl p-8 animate-bounce-in ${
            darkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Join a Team
            </h2>
            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enter Team Code
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-4 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300'
              }`}
              placeholder="e.g. 4FJ8KQ"
            />
            {joinError && (
              <div className="mb-2 text-red-600 text-sm">{joinError}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinTeam}
                disabled={!joinCode.trim()}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                  darkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
