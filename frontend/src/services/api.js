/**
 * API Service - Centralized API calls for backend communication
 * Base URL: http://localhost:8080
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to make API calls with error handling
const apiCall = async (endpoint, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Include cookies for session-based auth
    });

    // Handle unauthorized access
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    // Attempt to parse JSON, if no content return null
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * BILL ENDPOINTS
 */

// Add a new bill
export const addBill = async (billData) => {
  return apiCall("/bills/add-bill", {
    method: "POST",
    body: JSON.stringify(billData),
  });
};

// Get all bills
export const getAllBills = async () => {
  return apiCall("/bills/show-all-bills", {
    method: "GET",
  });
};

// Get bill by ID
export const getBillById = async (billId) => {
  return apiCall(`/bills/${billId}`, {
    method: "GET",
  });
};

// Update a bill
export const updateBill = async (billId, billData) => {
  return apiCall(`/bills/update-bill-details/${billId}`, {
    method: "PATCH",
    body: JSON.stringify(billData),
  });
};

// Delete a bill
export const deleteBill = async (billId) => {
  return apiCall(`/bills/delete-billid/${billId}`, {
    method: "DELETE",
  });
};


/**
 * STUDENT BILLS ENDPOINTS
 */

// Assign bill to student by roll number
export const assignBillToRoll = async (rollNumber, billId) => {
  return apiCall(`/student-bills/assign-to-roll/${rollNumber}/${billId}`, {
    method: "POST",
  });
};

// Assign bill to entire domain
export const assignBillToDomain = async (domain, billId) => {
  return apiCall(`/student-bills/assign-to-domain/${domain}/${billId}`, {
    method: "POST",
  });
};

// Get all bills for a student
export const getStudentBills = async (rollNumber) => {
  return apiCall(`/student-bills/all-bills-of-roll/${rollNumber}`, {
    method: "GET",
  });
};

// Delete all bills for a student
export const deleteStudentBill = async (rollNumber) => {
  return apiCall(`/student-bills/delete-student-bill/${rollNumber}`, {
    method: "DELETE",
  });
};

// Delete specific bill from student
export const deleteBillOfRoll = async (rollNumber, billId) => {
  return apiCall(`/student-bills/delete-bill-of-roll/${rollNumber}/bill/${billId}`, {
    method: "DELETE",
  });
};

/**
 * AUTHENTICATION ENDPOINTS
 */

// Login with Google
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};

// Get current user info
export const getCurrentUser = async () => {
  return apiCall("/auth/user", {
    method: "GET",
  });
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export default {
  // Bills
  addBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  // Student Bills
  assignBillToRoll,
  assignBillToDomain,
  getStudentBills,
  deleteStudentBill,
  deleteBillOfRoll,
  // Auth
  loginWithGoogle,
  getCurrentUser,
  logout,
};
