import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdAdminPanelSettings, MdSupervisorAccount } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="main">
      {/* HEADER */}
      <div className="header">
        <div className="logo-box">
          <img
            src="/favicon.ico.png"
            alt="Grievance Portal Logo"
            className="logo-image"
          />
        </div>
        <h2 class="apple">GRIEVANCE PORTAL</h2>
      </div>

      {/* TITLE */}
      <h1 class="ball">Select Your Role</h1>

      {/* CARDS */}
      <div className="cards">
        {/* USER */}
        <div className="card user" onClick={() => navigate("/user-login")}>
          <FaUserCircle className="icon user-icon" />
          <h3>User</h3>
          <p>Login as a regular user</p>
        </div>

        {/* SUPERVISOR */}
        <div
          className="card supervisor"
          onClick={() => navigate("/supervisor-login")}
        >
          <MdSupervisorAccount className="icon supervisor-icon" />
          <h3>Supervisor</h3>
          <p>Login as a supervisor</p>
        </div>

        {/* ADMIN */}
        <div className="card admin" onClick={() => navigate("/admin-login")}>
          <MdAdminPanelSettings className="icon admin-icon" />
          <h3>Admin</h3>
          <p>Login as an administrator</p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
