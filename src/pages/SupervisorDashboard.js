import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTint,
  FaBolt,
  FaRoad,
  FaRecycle,
  FaTrafficLight,
  FaHeartbeat,
  FaBook,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "./SupervisorDashboard.css";

const departments = [
  { label: "Water", icon: <FaTint /> },
  { label: "Electricity", icon: <FaBolt /> },
  { label: "Roads", icon: <FaRoad /> },
  { label: "Waste", icon: <FaRecycle /> },
  { label: "Traffic", icon: <FaTrafficLight /> },
  { label: "Health", icon: <FaHeartbeat /> },
  { label: "Education", icon: <FaBook /> },
  { label: "Safety", icon: <FaShieldAlt /> },
];

function SupervisorDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const session = JSON.parse(
      localStorage.getItem("supervisorSession") || "null",
    );
    if (session?.sessionToken) {
      try {
        await fetch("http://127.0.0.1:8000/api/supervisor/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_token: session.sessionToken }),
        });
      } catch (error) {
        console.error("Supervisor logout failed:", error);
      }
    }
    localStorage.removeItem("supervisorSession");
    navigate("/supervisor-login");
  };

  return (
    <div className="supervisor-dashboard-page">
      <div className="supervisor-dashboard-card">
        <div className="supervisor-header">
          <div className="supervisor-header-row">
            <div>
              <h1>Supervisor Portal</h1>
              <p>Select a department below to review complaints.</p>
            </div>
            <button className="supervisor-logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> BACK TO LOGIN
            </button>
          </div>
        </div>

        <div className="department-grid">
          {departments.map((department) => (
            <div
              key={department.label}
              className="department-card"
              onClick={() =>
                navigate(
                  `/supervisor-department/${encodeURIComponent(
                    department.label,
                  )}`,
                )
              }
            >
              <div className="department-icon">{department.icon}</div>
              <span>{department.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;
