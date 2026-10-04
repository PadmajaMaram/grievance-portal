import React, { useState, useRef } from "react";
import {
  FaFileAlt,
  FaImage,
  FaTimes,
  FaUpload,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import ComplaintCategorySelect from "../components/ComplaintCategorySelect";
import { complaintCategories } from "../utils/complaintCategories";
import { addStoredComplaint } from "../utils/complaintStorage";
import "./NewComplaint.css";

function NewComplaint() {
  const [category, setCategory] = useState(
    complaintCategories[0]?.value || "Water",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        setMessageType("error");
        setMessage(
          `❌ Invalid file type: ${file.name}. Only images and PDFs allowed.`,
        );
        setTimeout(() => setMessage(""), 3000);
        return false;
      }

      if (!isValidSize) {
        setMessageType("error");
        setMessage(`❌ File too large: ${file.name}. Maximum 10MB allowed.`);
        setTimeout(() => setMessage(""), 3000);
        return false;
      }

      return true;
    });

    setUploadedFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
      })),
    ]);
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!title.trim()) {
      setMessageType("error");
      setMessage("❌ Please enter a complaint title");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setMessageType("error");
      setMessage("❌ Please enter a complaint description");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("department", category);
      formData.append("category", category);
      formData.append(
        "user_email",
        JSON.parse(localStorage.getItem("user")).email,
      );

      uploadedFiles.forEach((fileObj, index) => {
        formData.append(`file_${index}`, fileObj.file);
      });

      const response = await fetch("http://127.0.0.1:8000/api/complaints/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setMessageType("success");
        setMessage(
          "✅ Complaint submitted successfully! A confirmation email has been sent to your inbox.",
        );

        const stats = JSON.parse(localStorage.getItem("complaintStats")) || {
          total: 0,
          pending: 0,
          resolved: 0,
        };
        stats.total += 1;
        stats.pending += 1;
        localStorage.setItem("complaintStats", JSON.stringify(stats));

        const newComplaint = {
          id: data.complaint_id || Date.now(),
          title,
          description,
          department: category,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attachments: [],
        };
        addStoredComplaint(newComplaint);

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 3000); // Increased delay to show the email message
      } else {
        setMessageType("error");
        setMessage("❌ " + (data.message || "Failed to submit complaint"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessageType("error");
      setMessage("🚨 Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (uploadedFiles.length > 0 || title.trim() || description.trim()) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Your changes will be lost.",
        )
      ) {
        window.location.href = "/dashboard";
      }
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="new-complaint-container">
      {/* Header */}
      <div className="complaint-header">
        <button className="back-btn" onClick={handleCancel}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-box">▶</div>
            <span>File New Complaint</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="complaint-form-container">
        <form onSubmit={handleSubmit} className="complaint-form">
          <ComplaintCategorySelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          {/* Title Field */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <FaFileAlt className="label-icon" />
              Complaint Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your complaint"
              className="form-input"
              maxLength="100"
              required
            />
            <div className="char-count">{title.length}/100</div>
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              <FaFileAlt className="label-icon" />
              Complaint Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your complaint..."
              className="form-textarea"
              rows="6"
              maxLength="1000"
              required
            />
            <div className="char-count">{description.length}/1000</div>
          </div>

          {/* File Upload Section */}
          <div className="form-group">
            <label className="form-label">
              <FaImage className="label-icon" />
              Attachments (Optional)
            </label>
            <p className="upload-info">
              Upload images or documents related to your complaint. Maximum 10MB
              per file.
            </p>

            {/* Drag and Drop Area */}
            <div
              className={`upload-area ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <FaUpload className="upload-icon" />
                <h4>Drag & Drop Files Here</h4>
                <p>or click to browse</p>
                <p className="upload-formats">
                  Supported: Images (JPG, PNG, GIF) and PDFs
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h4>Uploaded Files ({uploadedFiles.length})</h4>
                <div className="files-grid">
                  {uploadedFiles.map((fileObj) => (
                    <div key={fileObj.id} className="file-item">
                      <div className="file-preview">
                        {fileObj.preview ? (
                          <img src={fileObj.preview} alt={fileObj.file.name} />
                        ) : (
                          <FaFileAlt className="file-icon" />
                        )}
                      </div>
                      <div className="file-info">
                        <p className="file-name">{fileObj.file.name}</p>
                        <p className="file-size">
                          {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(fileObj.id)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && <div className={`message ${messageType}`}>{message}</div>}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaCheck />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewComplaint;
