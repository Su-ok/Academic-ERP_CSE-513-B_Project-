import React, { useState } from "react";
import { deleteStudentBill } from "../../services/api";

export default function DeleteStudentBill(): JSX.Element {
  const [rollNumber, setRollNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    if (!rollNumber.trim()) {
      setError("Roll number is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await deleteStudentBill(rollNumber);
      setSuccess(true);
      setRollNumber("");
      setConfirmDelete(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete student bills");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Delete Student Bills</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          All bills for student deleted successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number *</label>
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => {
              setRollNumber(e.target.value);
              setError("");
              setConfirmDelete(false);
            }}
            placeholder="Enter roll number..."
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {confirmDelete && (
          <div className="border border-red-400 bg-red-50 p-4 rounded-lg">
            <p className="text-red-800 font-semibold mb-4">
              Are you sure you want to delete ALL bills for roll number: <strong>{rollNumber}</strong>?
            </p>
            <p className="text-red-700 text-sm">This action cannot be undone.</p>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className={`w-full px-6 py-3 text-white rounded-lg font-semibold transition ${
            confirmDelete ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {loading ? "Deleting..." : confirmDelete ? "Confirm Delete" : "Delete All Bills"}
        </button>

        <button
          onClick={() => {
            setRollNumber("");
            setError("");
            setConfirmDelete(false);
          }}
          className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
