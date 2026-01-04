import React, { useState, useEffect } from "react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    darkMode: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData(userData);
    }

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("preferences");
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      setPreferences(prefs);
      applyDarkMode(prefs.darkMode);
    } else {
      // Check if system prefers dark mode
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyDarkMode(prefersDark);
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);
    
    if (key === "darkMode") {
      applyDarkMode(newPreferences.darkMode);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      localStorage.setItem("user", JSON.stringify(formData));
      setUser(formData);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = document.getElementById("current-password")?.value;
    const newPassword = document.getElementById("new-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      setMessage("Password changed successfully!");
      if (document.getElementById("current-password")) document.getElementById("current-password").value = "";
      if (document.getElementById("new-password")) document.getElementById("new-password").value = "";
      if (document.getElementById("confirm-password")) document.getElementById("confirm-password").value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error changing password");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = () => {
    setSaving(true);
    setMessage("");
    try {
      localStorage.setItem("preferences", JSON.stringify(preferences));
      setMessage("Preferences saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error saving preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className={`page-container space-y-6 transition-colors duration-300 ${preferences.darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className="animate-slide-up delay-0">
        <h1 className={`page-title ${preferences.darkMode ? 'text-white' : ''}`}>Settings</h1>
        <p className={`mt-2 ${preferences.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account and preferences</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium animate-slide-up ${
          message.includes("successfully")
            ? preferences.darkMode 
              ? "bg-green-900/30 text-green-300 border border-green-700"
              : "bg-green-50 text-green-700 border border-green-200"
            : preferences.darkMode
              ? "bg-red-900/30 text-red-300 border border-red-700"
              : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className={`flex gap-2 border-b animate-slide-up delay-100 ${preferences.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "profile"
              ? preferences.darkMode
                ? "text-blue-400 border-blue-400"
                : "text-blue-600 border-blue-600"
              : preferences.darkMode
                ? "text-gray-400 border-transparent hover:text-gray-300"
                : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "security"
              ? preferences.darkMode
                ? "text-blue-400 border-blue-400"
                : "text-blue-600 border-blue-600"
              : preferences.darkMode
                ? "text-gray-400 border-transparent hover:text-gray-300"
                : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === "preferences"
              ? preferences.darkMode
                ? "text-blue-400 border-blue-400"
                : "text-blue-600 border-blue-600"
              : preferences.darkMode
                ? "text-gray-400 border-transparent hover:text-gray-300"
                : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className={`glass-panel p-8 space-y-6 animate-slide-up delay-200 ${preferences.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Role
            </label>
            <select
              name="role"
              value={formData.role || "member"}
              disabled
              className={`w-full px-4 py-2.5 border rounded-lg cursor-not-allowed ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <p className={`text-xs mt-1 ${preferences.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role can only be changed by administrators</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className={`glass-panel p-8 space-y-6 animate-slide-up delay-200 ${preferences.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h3 className={`text-lg font-bold ${preferences.darkMode ? 'text-white' : 'text-gray-800'}`}>Change Password</h3>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your current password"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${preferences.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                preferences.darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 text-gray-900'
              }`}
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>

          <div className={`pt-6 border-t ${preferences.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${preferences.darkMode ? 'text-white' : 'text-gray-800'}`}>Danger Zone</h3>
            <button
              onClick={handleLogout}
              className={`w-full font-semibold py-2.5 rounded-lg transition-all border ${
                preferences.darkMode
                  ? 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border-red-700'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className={`glass-panel p-8 space-y-6 animate-slide-up delay-200 ${preferences.darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${preferences.darkMode ? 'text-white' : 'text-gray-800'}`}>Email Notifications</h3>
              <p className={`text-xs mt-1 ${preferences.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Receive email updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.emailNotifications}
                onChange={() => handlePreferenceChange("emailNotifications")}
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 rounded-full peer transition-colors ${
                preferences.emailNotifications 
                  ? 'bg-blue-600'
                  : preferences.darkMode ? 'bg-gray-600' : 'bg-gray-300'
              } peer-focus:outline-none peer-focus:ring-4 ${
                preferences.darkMode 
                  ? 'peer-focus:ring-blue-700'
                  : 'peer-focus:ring-blue-300'
              }`}></div>
              <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                preferences.emailNotifications ? 'translate-x-5' : ''
              }`}></div>
            </label>
          </div>

          {/* Desktop Notifications */}
          <div className={`flex items-center justify-between border-t pt-6 ${preferences.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div>
              <h3 className={`font-semibold ${preferences.darkMode ? 'text-white' : 'text-gray-800'}`}>Desktop Notifications</h3>
              <p className={`text-xs mt-1 ${preferences.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Get instant notifications on your desktop</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.desktopNotifications}
                onChange={() => handlePreferenceChange("desktopNotifications")}
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 rounded-full peer transition-colors ${
                preferences.desktopNotifications 
                  ? 'bg-blue-600'
                  : preferences.darkMode ? 'bg-gray-600' : 'bg-gray-300'
              } peer-focus:outline-none peer-focus:ring-4 ${
                preferences.darkMode 
                  ? 'peer-focus:ring-blue-700'
                  : 'peer-focus:ring-blue-300'
              }`}></div>
              <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                preferences.desktopNotifications ? 'translate-x-5' : ''
              }`}></div>
            </label>
          </div>

          {/* Dark Mode */}
          <div className={`flex items-center justify-between border-t pt-6 ${preferences.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div>
              <h3 className={`font-semibold ${preferences.darkMode ? 'text-white' : 'text-gray-800'}`}>🌙 Dark Mode</h3>
              <p className={`text-xs mt-1 ${preferences.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Use dark theme for the entire interface</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={preferences.darkMode}
                onChange={() => handlePreferenceChange("darkMode")}
                className="sr-only peer" 
              />
              <div className={`w-11 h-6 rounded-full peer transition-colors ${
                preferences.darkMode 
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              } peer-focus:outline-none peer-focus:ring-4 ${
                preferences.darkMode 
                  ? 'peer-focus:ring-blue-700'
                  : 'peer-focus:ring-blue-300'
              }`}></div>
              <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                preferences.darkMode ? 'translate-x-5' : ''
              }`}></div>
            </label>
          </div>

          <button 
            onClick={handleSavePreferences}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}
    </div>
  );
}
