import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeamCreation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    industry: "",
    size: "",
    website: ""
  });
  const [members, setMembers] = useState([{ email: "", role: "member" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTeamChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({ ...prev, [name]: value }));
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
    setError("");
    setLoading(true);

    try {
      // Simulate team creation
      const user = JSON.parse(localStorage.getItem("user"));
      const newTeam = {
        id: Date.now(),
        name: teamData.name,
        description: teamData.description,
        industry: teamData.industry,
        size: teamData.size,
        website: teamData.website,
        owner: user.id,
        members: members.filter(m => m.email),
        createdAt: new Date().toISOString()
      };

      // Save to localStorage (in real app, would be API call)
      const teams = JSON.parse(localStorage.getItem("teams") || "[]");
      teams.push(newTeam);
      localStorage.setItem("teams", JSON.stringify(teams));

      setSuccess("Team created successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = teamData.name && teamData.industry && teamData.size;
  const isStep2Valid = members.some(m => m.email);

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${
      darkMode 
        ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100'
    }`}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-bounce-in ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create Your Team
          </h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Set up your workspace and invite team members
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-700/60' : 'bg-red-50 text-red-700 border border-red-200'}`}>{error}</div>}
        {success && <div className={`mb-4 p-3 rounded-lg text-sm ${darkMode ? 'bg-green-900/30 text-green-300 border border-green-700/60' : 'bg-green-50 text-green-700 border border-green-200'}`}>{success}</div>}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  s <= step 
                    ? 'bg-blue-600 text-white' 
                    : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    s < step 
                      ? 'bg-blue-600' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Team Info</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Members</span>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Review</span>
          </div>
        </div>

        {/* Step 1: Team Information */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={teamData.name}
                onChange={handleTeamChange}
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
                value={teamData.description}
                onChange={handleTeamChange}
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
                  Industry *
                </label>
                <select
                  name="industry"
                  value={teamData.industry}
                  onChange={handleTeamChange}
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
                  Team Size *
                </label>
                <select
                  name="size"
                  value={teamData.size}
                  onChange={handleTeamChange}
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

            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Website
              </label>
              <input
                type="url"
                name="website"
                value={teamData.website}
                onChange={handleTeamChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'border-gray-300'
                }`}
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}

        {/* Step 2: Invite Members */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Invite team members by email
            </p>

            {members.map((member, index) => (
              <div key={index} className="flex gap-3 items-end">
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300'
                  }`}
                  placeholder="member@example.com"
                />
                <select
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, "role", e.target.value)}
                  className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
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
                    className={`px-3 py-2.5 rounded-lg transition-all ${
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
              className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              + Add Member
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Team Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Name:</span> <span className={darkMode ? 'text-white' : 'text-gray-900'}>{teamData.name}</span></p>
                <p><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Industry:</span> <span className={darkMode ? 'text-white' : 'text-gray-900'}>{teamData.industry}</span></p>
                <p><span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Size:</span> <span className={darkMode ? 'text-white' : 'text-gray-900'}>{teamData.size}</span></p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Members ({members.filter(m => m.email).length})</h3>
              <div className="space-y-2 text-sm">
                {members.filter(m => m.email).map((member, index) => (
                  <p key={index}>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{member.email}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                      member.role === 'admin'
                        ? darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                        : darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {member.role}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateTeam}
              disabled={loading}
              className={`flex-1 px-6 py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          )}
        </div>

        {/* Skip option */}
        <button
          onClick={() => navigate("/")}
          className={`w-full mt-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
