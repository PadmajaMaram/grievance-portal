import React from "react";
import { FaFileAlt } from "react-icons/fa";
import { complaintCategories } from "../utils/complaintCategories";

function ComplaintCategorySelect({ value, onChange }) {
  const selectedCategory =
    complaintCategories.find((category) => category.value === value) ||
    complaintCategories[0];
  const Icon = selectedCategory.Icon;

  return (
    <div className="form-group">
      <label htmlFor="category" className="form-label">
        <FaFileAlt className="label-icon" />
        Select Complaint Category *
      </label>
      <div className="select-with-icon">
        <span className="category-icon">{Icon && <Icon />}</span>
        <select
          id="category"
          value={value}
          onChange={onChange}
          className="form-input category-select"
          required
        >
          {complaintCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ComplaintCategorySelect;
