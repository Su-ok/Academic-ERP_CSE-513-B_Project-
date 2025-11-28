import { useState } from "react";
import { updateBill, getBillById } from "../../services/api";

export default function UpdateBill() {
  const [billId, setBillId] = useState("");
  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchBill = async (e: any) => {
    e.preventDefault();
    
    if (!billId.trim()) {
      setError("Bill ID is required");
      return;
    }

    setSearchLoading(true);
    setError("");
    setBill(null);

    try {
      const billData = await getBillById(billId as any);
      setBill(billData);
    } catch (err: any) {
      setError(err.message || "Bill not found");
      setBill(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setBill((prev: any) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleUpdateBill = async (e: any) => {
    e.preventDefault();

    if (!bill.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!bill.amount || parseFloat(bill.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (!bill.billDate) {
      setError("Bill date is required");
      return;
    }
    if (!bill.deadline) {
      setError("Deadline is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const billData = {
        description: bill.description,
        amount: parseFloat(bill.amount),
        billDate: bill.billDate,
        deadline: bill.deadline
      };

      await updateBill(bill.billId, billData);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBill(null);
        setBillId("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Update Bill</h1>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Bill updated successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search Form */}
      {!bill && (
        <form onSubmit={handleSearchBill} className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter Bill ID *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={billId}
                onChange={(e) => setBillId(e.target.value)}
                placeholder="Enter bill ID to search..."
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold transition"
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Update Form */}
      {bill && (
        <form onSubmit={handleUpdateBill} className="space-y-6">
          
          {/* Bill ID (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill ID (Read-only)
            </label>
            <input
              type="text"
              value={bill.billId}
              disabled
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={bill.description}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (₹) *
            </label>
            <input
              name="amount"
              value={bill.amount}
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Bill Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Date *
            </label>
            <input
              name="billDate"
              value={bill.billDate}
              type="date"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Deadline *
            </label>
            <input
              name="deadline"
              value={bill.deadline}
              type="date"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? "Updating..." : "Update Bill"}
            </button>
            <button
              type="button"
              onClick={() => {
                setBill(null);
                setBillId("");
                setError("");
              }}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
