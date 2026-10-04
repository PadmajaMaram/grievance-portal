const STORAGE_KEY = "grievance_complaints";

export function getStoredComplaints() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to read complaints from localStorage", error);
    return [];
  }
}

export function saveStoredComplaints(complaints) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
  } catch (error) {
    console.error("Failed to save complaints to localStorage", error);
  }
}

export function addStoredComplaint(newComplaint) {
  const complaints = getStoredComplaints();
  const updated = [newComplaint, ...complaints];
  saveStoredComplaints(updated);
  return updated;
}

export function getComplaintCounts(complaints = []) {
  const total = complaints.length;
  const pending = complaints.filter(
    (item) => (item.status || "").toString().toLowerCase() === "pending",
  ).length;
  const resolved = complaints.filter(
    (item) => (item.status || "").toString().toLowerCase() === "resolved",
  ).length;

  return { total, pending, resolved };
}
