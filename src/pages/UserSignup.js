import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaSignInAlt,
  FaArrowLeft,
} from "react-icons/fa";
import "./UserSignup.css";

function UserSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessageType("error");
      setMessage("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // Store user data with zero stats
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: name,
            email: email,
          }),
        );
        localStorage.setItem(
          "complaintStats",
          JSON.stringify({
            total: 0,
            pending: 0,
            resolved: 0,
          }),
        );

        setMessageType("success");
        setMessage("✅ Account Created! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessageType("error");
        setMessage("❌ " + (data.message || "Signup failed"));
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessageType("error");
      setMessage("🚨 Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-main">
      <div className="bg-deco circle-1" />
      <div className="bg-deco circle-2" />
      <div className="bg-deco circle-3" />

      <div className="signup-card">
        <a href="/user-login" className="back-link">
          <FaArrowLeft /> Back to Login
        </a>

        <div className="logo-title">
          <div className="logo-box">
            <FaUser />
          </div>
          <span>GRIENCE PORTAL</span>
        </div>

        <h1>Create Account</h1>
        <p className="subtext">Join us and file your first complaint.</p>

        {message && (
          <div className={`message message-${messageType}`}>{message}</div>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-box">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

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
              placeholder="Create a password"
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

          <div className="input-box">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button className="signup-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>Creating Account...
              </>
            ) : (
              <>
                <FaSignInAlt className="btn-icon" /> Sign Up
              </>
            )}
          </button>
        </form>

        <div className="login-link-section">
          <span>Already have an account?</span>
          <a href="/user-login" className="login-link">
            Log In →
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;
