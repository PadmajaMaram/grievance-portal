import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import AdminLogin from "./pages/AdminLogin";
import SupervisorLogin from "./pages/SupervisorLogin";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import SupervisorDepartmentPage from "./pages/SupervisorDepartmentPage";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import TrackComplaint from "./pages/TrackComplaint";
import ComplaintHistory from "./pages/ComplaintHistory";
import NewComplaint from "./pages/NewComplaint";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/supervisor-login" element={<SupervisorLogin />} />
        <Route
          path="/supervisor-department/:department"
          element={<SupervisorDepartmentPage />}
        />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/track-complaint/:complaintId?"
          element={<TrackComplaint />}
        />
        <Route path="/complaint-history" element={<ComplaintHistory />} />
        <Route path="/new-complaint" element={<NewComplaint />} />
      </Routes>
    </Router>
  );
}

export default App;
