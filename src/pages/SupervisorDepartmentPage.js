import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaExclamationCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./SupervisorDepartmentPage.css";

const randomLocations = [
  "Mumbai, India",
  "Delhi, India",
  "Bangalore, India",
  "Chennai, India",
  "Kolkata, India",
  "Hyderabad, India",
  "Pune, India",
  "Ahmedabad, India",
];

function SupervisorDepartmentPage() {
  const { department } = useParams();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const filteredComplaints = useMemo(() => {
    if (selectedPriority === "all") return complaints;
    return complaints.filter(
      (complaint) => complaint.priority?.toLowerCase() === selectedPriority,
    );
  }, [complaints, selectedPriority]);

  const priorityCounts = useMemo(
    () => ({
      all: complaints.length,
      high: complaints.filter((c) => c.priority === "high").length,
      medium: complaints.filter((c) => c.priority === "medium").length,
      low: complaints.filter((c) => c.priority === "low").length,
    }),
    [complaints],
  );

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError("");
      setComplaints([]);

      try {
        const response = await fetch(
          `https://grievance-portal-backend-e2b5.onrender.com/api/complaints/?department=${encodeURIComponent(
            department,
          )}`,
        );
        const data = await response.json();

        if (data.status === "success") {
          const complaintList = (data.complaints || []).map(
            (complaint, index) => ({
              ...complaint,
              location:
                complaint.location ||
                randomLocations[index % randomLocations.length],
            }),
          );
          setComplaints(complaintList);
        } else {
          setError(data.message || "Unable to load complaints.");
        }
      } catch (err) {
        setError("Unable to load complaints. Server connection failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [department]);

  return (
    <div className="supervisor-department-page">
      <div className="department-card-shell">
        <button
          className="department-back"
          onClick={() => navigate("/supervisor-dashboard")}
        >
          <FaArrowLeft /> Back to Supervisor Portal
        </button>

        <div className="department-header">
          <h1>{department} Complaints</h1>
          <p>
            Review complaints submitted for the {department.toLowerCase()}{" "}
            department.
          </p>
        </div>

        {!loading && !error && (
          <div className="department-filter-bar">
            <button
              className={`filter-button ${selectedPriority === "all" ? "active" : ""}`}
              onClick={() => setSelectedPriority("all")}
            >
              Total Complaints ({priorityCounts.all})
            </button>
            <button
              className={`filter-button high ${selectedPriority === "high" ? "active" : ""}`}
              onClick={() => setSelectedPriority("high")}
            >
              High ({priorityCounts.high})
            </button>
            <button
              className={`filter-button medium ${selectedPriority === "medium" ? "active" : ""}`}
              onClick={() => setSelectedPriority("medium")}
            >
              Medium ({priorityCounts.medium})
            </button>
            <button
              className={`filter-button low ${selectedPriority === "low" ? "active" : ""}`}
              onClick={() => setSelectedPriority("low")}
            >
              Low ({priorityCounts.low})
            </button>
          </div>
        )}

        {loading ? (
          <div className="department-loading">Loading complaints...</div>
        ) : error ? (
          <div className="department-error">{error}</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="department-empty">
            <FaExclamationCircle />
            <p>
              No{" "}
              {selectedPriority === "all"
                ? "complaints"
                : `${selectedPriority} priority complaints`}{" "}
              found for {department}.
            </p>
          </div>
        ) : (
          <div className="department-complaint-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id} className="department-complaint-card">
                <div className="complaint-card-header">
                  <h3>{complaint.title}</h3>
                  <span
                    className={`complaint-status status-${complaint.status}`}
                  >
                    {complaint.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p>{complaint.description}</p>
                <div className="complaint-meta">
                  <span>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                  <span>{complaint.department}</span>
                </div>
                <div className="complaint-location">
                  <button
                    className="location-link"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          complaint.location,
                        )}`,
                        "_blank",
                      )
                    }
                    title="Open location in Google Maps"
                  >
                    <FaMapMarkerAlt className="location-icon" />
                    {complaint.location}
                  </button>
                </div>
                <div className="complaint-attachments">
                  {complaint.attachments?.length ? (
                    <span>{complaint.attachments.length} attachments</span>
                  ) : (
                    <span>No attachments</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SupervisorDepartmentPage;
