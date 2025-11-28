import React, { useState } from "react";
import { assignBillToRoll } from "../../services/api";

export default function AssignToRoll(): JSX.Element {
  const [formData, setFormData] = useState<{ rollNumber: string; billId: string }>({ rollNumber: "", billId: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rollNumber.trim()) {
      setError("Roll number is required");
      return;
    }
    if (!formData.billId.trim()) {
      setError("Bill ID is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await assignBillToRoll(formData.rollNumber, formData.billId);
      setSuccess(true);
      setFormData({ rollNumber: "", billId: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to assign bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Assign Bill to Student (Roll Number)</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">Bill assigned successfully!</div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number *</label>
          <input
            name="rollNumber"
            value={formData.rollNumber}
            placeholder="Enter roll number..."
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bill ID *</label>
          <input
            name="billId"
            value={formData.billId}
            placeholder="Enter bill ID..."
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
        >
          {loading ? "Assigning..." : "Assign Bill"}
        </button>
      </form>
    </div>
  );
}
