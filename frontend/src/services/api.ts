const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

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

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error && (error as any).message) || `HTTP Error: ${response.status}`);
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

// Bills
export const addBill = async (billData: any) => {
  return apiCall("/bills/add-bill", {
    method: "POST",
    body: JSON.stringify(billData),
  });
};

export const getAllBills = async () => {
  return apiCall("/bills/show-all-bills", { method: "GET" });
};

export const getBillById = async (billId: number | string) => {
  return apiCall(`/bills/${billId}`, { method: "GET" });
};

export const updateBill = async (billId: number | string, billData: any) => {
  return apiCall(`/bills/update-bill-details/${billId}`, {
    method: "PATCH",
    body: JSON.stringify(billData),
  });
};

export const deleteBill = async (billId: number | string) => {
  return apiCall(`/bills/delete-billid/${billId}`, { method: "DELETE" });
};


// Student bills
export const assignBillToRoll = async (rollNumber: string, billId: number | string) => {
  return apiCall(`/student-bills/assign-to-roll/${rollNumber}/${billId}`, { method: "POST" });
};

export const assignBillToDomain = async (domain: string, billId: number | string) => {
  return apiCall(`/student-bills/assign-to-domain/${encodeURIComponent(domain)}/${billId}`, { method: "POST" });
};

export const getStudentBills = async (rollNumber: string) => {
  return apiCall(`/student-bills/all-bills-of-roll/${rollNumber}`, { method: "GET" });
};

export const deleteStudentBill = async (rollNumber: string) => {
  return apiCall(`/student-bills/delete-student-bill/${rollNumber}`, { method: "DELETE" });
};

export const deleteBillOfRoll = async (rollNumber: string, billId: number | string) => {
  return apiCall(`/student-bills/delete-bill-of-roll/${rollNumber}/bill/${billId}`, { method: "DELETE" });
};

// Auth
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};

export const getCurrentUser = async () => {
  return apiCall(`/auth/user`, { method: "GET" });
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export default {
  addBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  // Student
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
