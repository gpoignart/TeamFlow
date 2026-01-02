import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const API_BASE_URL = "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false); // toggle login/register

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password || (isRegister && !formData.email)) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const url = isRegister
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isRegister ? "Registration failed." : "Login failed."));
      }

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/"); // Redirect to Dashboard/Home
    } catch (err) {
      setError(err.message || "Error during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">{isRegister ? "Create Account" : "Welcome Back"}</h1>
        <p className="login-subtitle">
          {isRegister
            ? "Fill in your details to register"
            : "Enter your credentials to access TeamFlow"}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. gpoignart"
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. example@mail.com"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading
              ? isRegister
                ? "Registering..."
                : "Signing in..."
              : isRegister
              ? "Register"
              : "Sign In"}
          </button>
        </form>

        <div className="toggle-auth">
          {isRegister ? (
            <p>
              Already have an account?{" "}
              <button onClick={() => setIsRegister(false)}>Sign In</button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsRegister(true)}>Register</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}