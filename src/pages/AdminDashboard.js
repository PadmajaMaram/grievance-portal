import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaCog,
  FaChartLine,
  FaClipboardList,
  FaLayerGroup,
  FaUserShield,
  FaFolderOpen,
  FaPlus,
  FaSignOutAlt,
} from "react-icons/fa";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({
    Infrastructure: 0,
    Service: 0,
    Staff: 0,
  });
  const [priorityCounts, setPriorityCounts] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });
  const totalCategoryCount = Object.values(categoryCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const categoryData = [
    {
      name: "Infrastructure",
      value: categoryCounts.Infrastructure,
      color: "#4b6bff",
    },
    { name: "Service", value: categoryCounts.Service, color: "#27d0ff" },
    { name: "Staff", value: categoryCounts.Staff, color: "#67e2a7" },
  ];

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} L ${cx} ${cy} Z`;
  };

  const pieSegments = [];
  let currentAngle = 0;
  categoryData.forEach((item) => {
    if (item.value > 0) {
      const sweep = (item.value / Math.max(totalCategoryCount, 1)) * 360;
      pieSegments.push({
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
      });
      currentAngle += sweep;
    }
  });

  const [priorityCategories, setPriorityCategories] = useState({
    high: [],
    medium: [],
    low: [],
  });
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(
          "https://grievance-portal-backend-e2b5.onrender.com/api/complaints/",
        );
        const data = await response.json();

        if (data.status === "success") {
          const complaints = data.complaints || [];
          const total = complaints.length;
          const pending = complaints.filter(
            (item) => item.status === "pending",
          ).length;
          const inProgress = complaints.filter(
            (item) => item.status === "in_progress",
          ).length;
          const resolved = complaints.filter(
            (item) => item.status === "resolved",
          ).length;
          const closed = complaints.filter(
            (item) => item.status === "closed",
          ).length;

          const categoryCounts = complaints.reduce(
            (acc, item) => {
              const category =
                item.department ||
                item.category ||
                item.type ||
                "Infrastructure";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            { Infrastructure: 0, Service: 0, Staff: 0 },
          );

          const activeComplaints = complaints.filter(
            (item) => item.status !== "resolved" && item.status !== "closed",
          );

          const priorityCounts = activeComplaints.reduce(
            (acc, item) => {
              const priority = (item.priority || "low")
                .toString()
                .toLowerCase();
              if (priority === "high") acc.high += 1;
              else if (priority === "medium") acc.medium += 1;
              else acc.low += 1;
              return acc;
            },
            { high: 0, medium: 0, low: 0 },
          );

          const priorityCategories = activeComplaints.reduce(
            (acc, item) => {
              const priority = (item.priority || "low")
                .toString()
                .toLowerCase();
              const category =
                item.department ||
                item.category ||
                item.type ||
                "Infrastructure";
              if (!acc[priority]) {
                acc[priority] = {};
              }
              acc[priority][category] = (acc[priority][category] || 0) + 1;
              return acc;
            },
            { high: {}, medium: {}, low: {} },
          );

          const normalizedPriorityCategories = {
            high: Object.entries(priorityCategories.high || {}).sort(
              ([, aCount], [, bCount]) => bCount - aCount,
            ),
            medium: Object.entries(priorityCategories.medium || {}).sort(
              ([, aCount], [, bCount]) => bCount - aCount,
            ),
            low: Object.entries(priorityCategories.low || {}).sort(
              ([, aCount], [, bCount]) => bCount - aCount,
            ),
          };

          setStats({ total, pending, inProgress, resolved, closed });
          setCategoryCounts(categoryCounts);
          setPriorityCounts(priorityCounts);
          setPriorityCategories(normalizedPriorityCategories);
          setRecentComplaints(
            complaints
              .slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 5),
          );
        }
      } catch (error) {
        console.error("Admin dashboard load failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
    const intervalId = setInterval(fetchComplaints, 10000);
    fetchSupervisorRequests();

    return () => clearInterval(intervalId);
  }, []);

  async function fetchSupervisorRequests() {
    try {
      const response = await fetch(
        "https://grievance-portal-backend-e2b5.onrender.com/api/admin/supervisor-requests/",
      );
      const data = await response.json();
      if (data.status === "success") {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to load supervisor requests:", error);
      setRequestError("Unable to load supervisor requests.");
    }
  }

  const handleReviewRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    setRequestError("");
    try {
      const response = await fetch(
        `https://grievance-portal-backend-e2b5.onrender.com/api/admin/supervisor-requests/${requestId}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );
      const data = await response.json();
      if (data.status === "success") {
        fetchSupervisorRequests();
      } else {
        setRequestError(data.message || "Failed to update request status.");
      }
    } catch (error) {
      console.error("Review request error:", error);
      setRequestError("Failed to update request status.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("complaintStats");
    window.location.href = "/user-login";
  };

  return (
    <div className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h2>Complaint</h2>
            <span>Management</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button className="nav-item active">
            <FaChartLine /> Dashboard
          </button>
          <button className="nav-item">
            <FaClipboardList /> Complaints
          </button>
          <button className="nav-item">
            <FaLayerGroup /> Departments
          </button>
          <button className="nav-item">
            <FaUserShield /> Users
          </button>
          <button className="nav-item">
            <FaChartLine /> Reports & Analytics
          </button>
          <button className="nav-item">
            <FaCog /> Settings
          </button>
        </nav>

        <button className="logout-action" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="topbar-label">Overview</p>
            <h1>Complaint Management System</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button">
              <FaBell />
            </button>
            <button className="icon-button">
              <FaCog />
            </button>
            <div className="admin-profile">
              <div className="profile-avatar">A</div>
              <div>
                <span>Admin</span>
                <p>Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <section className="overview-grid">
          <div className="stat-card stat-total">
            <span>Total Complaints</span>
            <strong>{loading ? "—" : stats.total}</strong>
            <p>All Time</p>
          </div>
          <div className="stat-card stat-pending">
            <span>Pending</span>
            <strong>{loading ? "—" : stats.pending}</strong>
            <p>Needs Attention</p>
          </div>
          <div className="stat-card stat-progress">
            <span>In Progress</span>
            <strong>{loading ? "—" : stats.inProgress}</strong>
            <p>Active</p>
          </div>
          <div className="stat-card stat-resolved">
            <span>Resolved</span>
            <strong>{loading ? "—" : stats.resolved}</strong>
            <p>Completed</p>
          </div>
        </section>

        <section className="dashboard-panels">
          <div className="panel priority-panel">
            <div className="panel-header">
              <h2>Overall Priority Distribution</h2>
            </div>
            <div className="priority-grid">
              <div className="priority-card priority-high">
                <span>High Priority</span>
                <strong>{loading ? "—" : priorityCounts.high}</strong>
              </div>
              <div className="priority-card priority-medium">
                <span>Medium Priority</span>
                <strong>{loading ? "—" : priorityCounts.medium}</strong>
              </div>
              <div className="priority-card priority-low">
                <span>Low Priority</span>
                <strong>{loading ? "—" : priorityCounts.low}</strong>
              </div>
            </div>
            <div className="priority-details">
              <div className="priority-details-column">
                <h3>High Priority Categories</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : priorityCategories.high.length > 0 ? (
                  <ul>
                    {priorityCategories.high.map(([category, count]) => (
                      <li key={category}>
                        {category} <span>({count})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No high priority complaints yet.</p>
                )}
              </div>
              <div className="priority-details-column">
                <h3>Medium Priority Categories</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : priorityCategories.medium.length > 0 ? (
                  <ul>
                    {priorityCategories.medium.map(([category, count]) => (
                      <li key={category}>
                        {category} <span>({count})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No medium priority complaints yet.</p>
                )}
              </div>
              <div className="priority-details-column">
                <h3>Low Priority Categories</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : priorityCategories.low.length > 0 ? (
                  <ul>
                    {priorityCategories.low.map(([category, count]) => (
                      <li key={category}>
                        {category} <span>({count})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No low priority complaints yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="panel pie-panel">
            <div className="panel-header">
              <h2>Complaints by Category</h2>
            </div>
            <p className="panel-subtitle">
              Each slice sized & colored by count in categories
            </p>
            <div className="pie-info">
              <div className="pie-legend">
                {Object.entries(categoryCounts).map(([category, value]) => (
                  <div key={category} className="legend-row">
                    <div className="legend-label">
                      <span
                        className={`legend-dot legend-${category.toLowerCase()}`}
                      />
                      <strong>{category}</strong>
                    </div>
                    <span className="legend-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="recent-panel">
          <div className="recent-header">
            <div>
              <h2>Recent Complaints</h2>
            </div>
            <a href="/complaint-history" className="view-all">
              View All →
            </a>
          </div>

          <div className="complaints-table">
            <div className="table-row header-row">
              <span>ID</span>
              <span>Title</span>
              <span>Category</span>
              <span>Department</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {loading ? (
              <div className="table-row loading-row">Loading complaints...</div>
            ) : (
              recentComplaints.map((item) => (
                <div key={item.id} className="table-row">
                  <span>#{item.id}</span>
                  <span>{item.title || "Untitled"}</span>
                  <span>{item.category || "Infrastructure"}</span>
                  <span>{item.department || "Maintenance"}</span>
                  <span
                    className={`status-badge status-${item.status || "pending"}`}
                  >
                    {item.status?.replace("_", " ") || "Pending"}
                  </span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel requests-panel">
          <div className="panel-header">
            <h2>Supervisor Access Requests</h2>
            <p>Approve or reject supervisor login requests below.</p>
          </div>
          {requestError && (
            <div className="admin-request-error">{requestError}</div>
          )}
          <div className="requests-table">
            <div className="table-row header-row">
              <span>Email</span>
              <span>Status</span>
              <span>Requested At</span>
              <span>Actions</span>
            </div>
            {requests.length === 0 ? (
              <div className="table-row loading-row">
                No supervisor requests found.
              </div>
            ) : (
              requests.map((item) => (
                <div key={item.id} className="table-row">
                  <span>{item.email}</span>
                  <span>{item.status.replace(/_/g, " ")}</span>
                  <span>
                    {new Date(item.requested_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>
                    {item.status === "pending" ? (
                      <>
                        <button
                          className="action-btn approve"
                          disabled={processingRequestId === item.id}
                          onClick={() =>
                            handleReviewRequest(item.id, "approve")
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="action-btn reject"
                          disabled={processingRequestId === item.id}
                          onClick={() => handleReviewRequest(item.id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span>Processed</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="quick-actions-panel">
          <div className="quick-actions-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-buttons">
            <button className="quick-action-btn blue">
              <FaFolderOpen /> View All Complaints
            </button>
            <button className="quick-action-btn outline">
              <FaPlus /> Add Department
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
