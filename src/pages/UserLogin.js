import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser, FaSignInAlt } from "react-icons/fa";
import "./UserLogin.css";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://grievance-portal-backend-e2b5.onrender.com/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        // Store user data
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.name || "User",
            email: email,
          }),
        );

        // Initialize complaint stats with zeros if not present
        const stats = JSON.parse(localStorage.getItem("complaintStats"));
        if (!stats) {
          localStorage.setItem(
            "complaintStats",
            JSON.stringify({
              total: 0,
              pending: 0,
              resolved: 0,
            }),
          );
        }

        setMessageType("success");
        setMessage("Login Successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(" " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessageType("error");
      setMessage(" Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <div className="bg-deco circle-1" />
      <div className="bg-deco circle-2" />
      <div className="bg-deco circle-3" />

      <div className="login-card">
        <div className="logo-title">
          <div className="logo-box">
            <FaUser />
          </div>
          <span>GRIENCE PORTAL</span>
        </div>

        <h1>User Login</h1>
        <p className="subtext">Login to access your account.</p>

        <div className="avatar">👤</div>

        {message && (
          <div className={`message message-${messageType}`}>{message}</div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-box">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="input-box">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="show-password"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>Logging in...
              </>
            ) : (
              <>
                <FaSignInAlt className="btn-icon" /> Log In
              </>
            )}
          </button>
        </form>

        <a href="#" className="forgot-password">
          Forgot password?
        </a>

        <div className="signup-line">
          <span>Don’t have an account?</span>
          <a href="/user-signup" className="signup-link">
            Sign Up →
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
