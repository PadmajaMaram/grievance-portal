import React, { useState, useEffect } from "react";
import {
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaMapPin,
  FaHistory,
  FaBell,
} from "react-icons/fa";
import {
  getStoredComplaints,
  saveStoredComplaints,
  getComplaintCounts,
} from "../utils/complaintStorage";
import "./Dashboard.css";

function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [, setComplaints] = useState([]);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [pending, setPending] = useState(0);
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    setUserName(user.name || "User");

    const storedComplaints = getStoredComplaints();
    if (storedComplaints.length) {
      setComplaints(storedComplaints);
      const counts = getComplaintCounts(storedComplaints);
      setTotalComplaints(counts.total);
      setPending(counts.pending);
      setResolved(counts.resolved);
    } else {
      const stats = JSON.parse(localStorage.getItem("complaintStats")) || {
        total: 0,
        pending: 0,
        resolved: 0,
      };
      setTotalComplaints(stats.total);
      setPending(stats.pending);
      setResolved(stats.resolved);
    }

    const fetchStats = async () => {
      if (!user.email) {
        return;
      }

      try {
        const response = await fetch(
          `https://grievance-portal-backend-e2b5.onrender.com/api/complaints/?user_email=${encodeURIComponent(
            user.email,
          )}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          const backendComplaints = data.complaints || [];
          setComplaints(backendComplaints);
          saveStoredComplaints(backendComplaints);

          const counts = getComplaintCounts(backendComplaints);
          setTotalComplaints(counts.total);
          setPending(counts.pending);
          setResolved(counts.resolved);
          localStorage.setItem("complaintStats", JSON.stringify(counts));
        }
      } catch (error) {
        // Keep local storage values when backend data is unavailable.
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("complaintStats");
    localStorage.removeItem("grievance_complaints");
    window.location.href = "/user-login";
  };

  const handleResetStats = () => {
    const resetStats = { total: 0, pending: 0, resolved: 0 };
    localStorage.setItem("complaintStats", JSON.stringify(resetStats));
    localStorage.removeItem("grievance_complaints");
    setComplaints([]);
    setTotalComplaints(0);
    setPending(0);
    setResolved(0);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-section-dash">
          <div className="logo-box-dash">▶</div>
          <span>Complaint Companion</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <FaChartBar /> Dashboard
          </div>
          <div className="nav-item">
            <FaFileAlt /> File Complaint
          </div>
          <div className="nav-item">
            <FaMapPin /> Track Complaint
          </div>
          <div className="nav-item">
            <FaHistory /> History / Notifications
          </div>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <FaMapPin className="location-icon" />
            <span className="location-text">Mumbai, Maharashtra</span>
            <span className="location-status">● Live Location</span>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search complaints, ID, or keywords..."
            />
          </div>

          <div className="header-right">
            <div className="notification-bell">
              <FaBell />
              <span className="notification-badge">1</span>
            </div>
            <div className="user-profile">
              <div className="user-avatar">
                <span>{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-email">
                  {JSON.parse(localStorage.getItem("user"))?.email ||
                    "user@email.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {userName}! 👋</h1>
          <p>Here's what's happening with your complaints</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-total">
            <div className="stat-card-header">
              <div className="stat-icon total">
                <FaChartBar />
              </div>
              <span className="stat-badge">{totalComplaints}</span>
            </div>
            <h3>
              Total Complaints
              <span className="stat-label-count">({totalComplaints})</span>
            </h3>
            <p className="stat-number stat-number-total">{totalComplaints}</p>
            <button type="button" className="stat-link">
              View all →
            </button>
          </div>

          <div className="stat-card stat-card-pending">
            <div className="stat-card-header">
              <div className="stat-icon pending">
                <FaClock />
              </div>
              <span className="stat-badge">{pending}</span>
            </div>
            <h3>
              Pending
              <span className="stat-label-count">({pending})</span>
            </h3>
            <p className="stat-number">{pending}</p>
            <button type="button" className="stat-link">
              View details →
            </button>
          </div>

          <div className="stat-card stat-card-resolved">
            <div className="stat-card-header">
              <div className="stat-icon resolved">
                <FaCheckCircle />
              </div>
              <span className="stat-badge">{resolved}</span>
            </div>
            <h3>
              Resolved
              <span className="stat-label-count">({resolved})</span>
            </h3>
            <p className="stat-number">{resolved}</p>
            <button type="button" className="stat-link">
              View history →
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="actions-header">
            <h2>Quick Actions</h2>
            <button className="stat-reset-btn" onClick={handleResetStats}>
              Reset Stats
            </button>
          </div>
          <p className="sub-text">What would you like to do today?</p>

          <div className="actions-grid">
            <div className="action-card file-complaint">
              <div className="action-icon">
                <FaFileAlt />
              </div>
              <h4>File a New Complaint</h4>
              <p>Report an issue with photos and location details</p>
              <button
                className="action-btn primary"
                onClick={() => (window.location.href = "/new-complaint")}
              >
                + Start New Complaint
              </button>
            </div>

            <div className="action-card track-complaint">
              <div className="action-icon">
                <FaMapPin />
              </div>
              <h4>Track Complaint</h4>
              <p>Check real-time status of your existing complaint</p>
              <button
                className="action-btn secondary"
                onClick={() => (window.location.href = "/track-complaint")}
              >
                Track Complaint →
              </button>
            </div>

            <div className="action-card view-history">
              <div className="action-icon">
                <FaHistory />
              </div>
              <h4>View History</h4>
              <p>Browse your past complaints and resolutions</p>
              <button
                className="action-btn tertiary"
                onClick={() => (window.location.href = "/complaint-history")}
              >
                View All Complaints
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
