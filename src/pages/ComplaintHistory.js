import React, { useEffect, useMemo, useState } from "react";
import { FaSearch, FaFilter, FaSort } from "react-icons/fa";
import "./ComplaintHistory.css";

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    if (!user.email) {
      window.location.href = "/user-login";
      return;
    }

    const fetchComplaints = async () => {
      try {
        const response = await fetch(
          `https://grievance-portal-backend-e2b5.onrender.com/api/complaints/?user_email=${encodeURIComponent(
            user.email,
          )}`,
        );
        const data = await response.json();
        if (data.status === "success") {
          setComplaints(data.complaints || []);
        } else {
          setError(data.message || "Unable to load complaints.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const visibleComplaints = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return complaints
      .filter((complaint) => {
        if (filterStatus !== "all" && complaint.status !== filterStatus) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }
        const content =
          `${complaint.title} ${complaint.description} ${statusLabels[complaint.status] || complaint.status}`.toLowerCase();
        return content.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortOrder === "oldest") {
          return new Date(a.created_at) - new Date(b.created_at);
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [complaints, filterStatus, searchQuery, sortOrder]);

  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  const handleDelete = (id) => {
    setComplaints((current) =>
      current.filter((complaint) => complaint.id !== id),
    );
  };

  return (
    <div className="history-page">
      <div className="history-card">
        <div className="history-header">
          <div>
            <h1>Complaint History</h1>
            <p>Search, filter, and sort all your submitted complaints.</p>
          </div>
          <button
            className="history-back"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        <div className="history-controls">
          <label className="history-search">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          <div className="history-filters">
            <label className="filter-select">
              <span>
                <FaFilter className="icon" /> Filter:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Complaints</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <label className="filter-select">
              <span>
                <FaSort className="icon" /> Sort:
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="history-empty">Loading complaints...</div>
        ) : error ? (
          <div className="history-empty">{error}</div>
        ) : visibleComplaints.length === 0 ? (
          <div className="history-empty">
            No complaints match the current search or filter.
          </div>
        ) : (
          <div className="complaint-list">
            {visibleComplaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-card-header">
                  <h2>{complaint.title}</h2>
                  <span className={`status-pill status-${complaint.status}`}>
                    Status: {statusLabels[complaint.status] || complaint.status}
                  </span>
                </div>

                <div className="complaint-meta">
                  <div>
                    <span>Date</span>
                    <strong>
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{complaint.location || "Unknown"}</strong>
                  </div>
                </div>

                <p className="complaint-description">
                  {truncateDescription(complaint.description, 96)}
                </p>

                <div className="complaint-actions">
                  <button
                    className="btn-primary"
                    onClick={() =>
                      (window.location.href = `/track-complaint/${complaint.id}`)
                    }
                  >
                    View Details
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDelete(complaint.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintHistory;
