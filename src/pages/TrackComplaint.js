import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaCircle,
  FaInfoCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./TrackComplaint.css";

const timelineSteps = [
  "Submitted",
  "Under Review",
  "Assigned",
  "In Progress",
  "Resolved",
];

const getStatusMessage = (status) => {
  switch (status) {
    case "pending":
      return "Your complaint has been submitted and is under review.";
    case "in_progress":
      return "Your complaint has been assigned to the department and work is in progress.";
    case "resolved":
      return "Your complaint has been resolved successfully.";
    case "closed":
      return "Your complaint has been closed.";
    default:
      return "Your complaint is being processed.";
  }
};

const getCompletedSteps = (status) => {
  switch (status) {
    case "pending":
      return 1;
    case "in_progress":
      return 3;
    case "resolved":
      return 5;
    case "closed":
      return 5;
    default:
      return 0;
  }
};

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

function TrackComplaint() {
  const { complaintId } = useParams();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    if (!user.email) {
      window.location.href = "/user-login";
      return;
    }
    setUserEmail(user.email);
    fetchComplaints(user.email, complaintId);
  }, [complaintId]);

  const fetchComplaints = async (email, complaintIdParam) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/complaints/?user_email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (data.status === "success") {
        let complaintList = data.complaints || [];

        // Assign random locations to complaints without locations
        complaintList = complaintList.map((complaint, index) => ({
          ...complaint,
          location:
            complaint.location ||
            randomLocations[index % randomLocations.length],
        }));

        setComplaints(complaintList);

        const selected = complaintIdParam
          ? complaintList.find(
              (item) => String(item.id) === String(complaintIdParam),
            )
          : null;

        setSelectedComplaint(selected || complaintList[0] || null);
      } else {
        setMessage(data.message || "Unable to load complaints.");
      }
    } catch (error) {
      console.error("Track complaint error:", error);
      setMessage(
        "🚨 Cannot connect to the backend. Start the server and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMapUrl = (location) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location,
    )}`;

  const selectedLocation = selectedComplaint?.location?.trim();
  const isLocationAvailable =
    selectedLocation && selectedLocation.toLowerCase() !== "unknown";

  const handleOpenMap = () => {
    if (!isLocationAvailable) return;
    window.open(getMapUrl(selectedLocation), "_blank");
  };

  const handleTrackAnother = () => {
    if (complaints.length > 1) {
      const nextIndex =
        (complaints.indexOf(selectedComplaint) + 1) % complaints.length;
      setSelectedComplaint(complaints[nextIndex]);
    }
  };

  if (loading) {
    return <div className="track-container">Loading...</div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="track-container">
        <div className="empty-state">
          <h2>No Complaints Found</h2>
          <p>You haven't filed any complaints yet.</p>
          <button onClick={() => (window.location.href = "/new-complaint")}>
            File a New Complaint
          </button>
        </div>
      </div>
    );
  }

  const complaint = selectedComplaint;
  const completedSteps = getCompletedSteps(complaint.status);
  const currentStep = Math.min(completedSteps, 5);

  return (
    <div className="track-container">
      <div className="track-card">
        <div className="track-header">
          <div className="header-left">
            <FaCheckCircle className="icon" />
            <h1>Track Your Complaint</h1>
          </div>
          <button className="track-another" onClick={handleTrackAnother}>
            Track Another →
          </button>
        </div>

        {message && <div className="error-message">{message}</div>}

        {complaint && (
          <>
            <div className="complaint-info">
              <div className="complaint-id-section">
                <h2>{complaint.id}</h2>
                <p>{complaint.title}</p>
              </div>
              <div className="status-badge" data-status={complaint.status}>
                {complaint.status === "pending"
                  ? "Submitted"
                  : complaint.status === "in_progress"
                    ? "In Progress"
                    : complaint.status === "resolved"
                      ? "Resolved"
                      : "Closed"}
              </div>
            </div>

            <div className="updated-info">
              Updated{" "}
              {new Date(complaint.created_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
              ,{" "}
              {new Date(complaint.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="timeline">
              {timelineSteps.map((step, index) => (
                <div key={index} className="timeline-step">
                  <div
                    className={`timeline-circle ${
                      index < currentStep ? "completed" : ""
                    } ${index === currentStep - 1 ? "active" : ""}`}
                  >
                    {index < currentStep ? <FaCheckCircle /> : <FaCircle />}
                  </div>
                  <span className="step-label">{step}</span>
                  {index < timelineSteps.length - 1 && (
                    <div
                      className={`timeline-line ${
                        index < currentStep - 1 ? "completed" : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="info-box">
              <FaInfoCircle className="info-icon" />
              <p>{getStatusMessage(complaint.status)}</p>
            </div>

            <div className="complaint-details">
              <div className="detail-row">
                <strong>Location</strong>
                <button
                  className="location-link"
                  onClick={handleOpenMap}
                  disabled={!isLocationAvailable}
                  title={
                    isLocationAvailable ? "Open map" : "Location unavailable"
                  }
                >
                  <FaMapMarkerAlt className="location-icon" />
                  {isLocationAvailable ? selectedLocation : "Unknown location"}
                </button>
              </div>
              <div className="detail-row description-row">
                <strong>Description</strong>
                <span>{complaint.description}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Back to Dashboard
              </button>
              <button
                className="btn-primary"
                onClick={() => fetchComplaints(userEmail)}
              >
                Refresh Status
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TrackComplaint;
