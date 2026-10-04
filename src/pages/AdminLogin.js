import React, { useState } from "react";
import { FaEnvelope, FaLock, FaRobot, FaSignInAlt } from "react-icons/fa";
import "./AdminLogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const allowedAdminEmails = [
    "yerukalareddymaram@gmail.com",
    "maramvenkatapadmaja@gmail.com",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const emailAllowed = allowedAdminEmails.includes(normalizedEmail);

    if (!emailAllowed) {
      setLoading(false);
      setMessage(
        "❌ Access denied. This admin portal only allows two authorized email addresses.",
      );
      return;
    }

    if (!password.trim()) {
      setLoading(false);
      setMessage("❌ Please enter your password.");
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setMessage("✅ Login successful. Redirecting...");
      window.location.href = "/admin-dashboard";
    }, 800);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />
        <div className="bg-glow glow-3" />
      </div>

      <div className="admin-card">
        <div className="admin-logo-box">
          <FaRobot className="admin-logo-icon" />
        </div>
        <h1 className="admin-title">Grievance Portal AI</h1>
        <p className="admin-subtitle">Admin Panel Login</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-input-label">
            <span>Email</span>
            <div className="admin-input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="admin-input-label">
            <span>Password</span>
            <div className="admin-input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && <div className="admin-message">{message}</div>}

        <p className="admin-footnote">
          Access Restricted to Authorized Admins Only
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
