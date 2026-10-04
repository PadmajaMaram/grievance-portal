import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function SupervisorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendRequest = async () => {
    if (!email.trim() || !password.trim()) {
      setMessageType("error");
      setMessage(
        "❌ Please enter both email and password before sending request.",
      );
      return;
    }

    setRequestLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/supervisor/request-access/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
      );
      const data = await response.json();

      setMessageType(data.status === "success" ? "success" : "error");
      setMessage(data.message || "Unable to send request.");
    } catch (error) {
      console.error("Supervisor request error:", error);
      setMessageType("error");
      setMessage("🚨 Server connection failed. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setLoading(false);
      setMessageType("error");
      setMessage("❌ Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(
        "https://grievance-portal-backend-e2b5.onrender.com/api/supervisor/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        },
      );
      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem(
          "supervisorSession",
          JSON.stringify({
            email: email.trim().toLowerCase(),
            sessionToken: data.session_token,
          }),
        );
        setMessageType("success");
        setMessage("✅ Login successful. Redirecting...");
        setTimeout(() => {
          navigate("/supervisor-dashboard");
        }, 800);
      } else {
        setMessageType("error");
        setMessage("❌ " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessageType("error");
      setMessage("🚨 Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
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
          <FaUserShield className="admin-logo-icon" />
        </div>
        <h1 className="admin-title">Supervisor Portal</h1>
        <p className="admin-subtitle">Supervisor Panel Login</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-input-label">
            <span>Email</span>
            <div className="admin-input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Supervisor Email"
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

          <button
            type="button"
            className="admin-request-btn"
            disabled={requestLoading}
            onClick={handleSendRequest}
          >
            {requestLoading ? "Sending request..." : "Send a request"}
          </button>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <div className={`admin-message admin-message-${messageType}`}>
            {message}
          </div>
        )}

        <p className="admin-footnote">
          Access Restricted to Authorized Supervisors Only
        </p>
      </div>
    </div>
  );
}

export default SupervisorLogin;
