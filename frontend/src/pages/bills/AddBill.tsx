import { useState } from "react";
import { addBill } from "../../services/api";

export default function AddBill() {
  const [bill, setBill] = useState<any>({
    description: "",
    amount: "",
    billDate: "",
    deadline: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setBill((prev: any) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!bill.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!bill.amount || parseFloat(bill.amount) <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    if (!bill.billDate) {
      setError("Bill date is required");
      return false;
    }
    if (!bill.deadline) {
      setError("Deadline is required");
      return false;
    }
    if (new Date(bill.billDate) > new Date(bill.deadline)) {
      setError("Deadline must be after bill date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const billData = {
        description: bill.description,
        amount: Math.round(parseFloat(bill.amount) * 100) / 100,
        billDate: bill.billDate,
        deadline: bill.deadline
      };

      await addBill(billData);
      
      setSuccess(true);
      setBill({ description: "", amount: "", billDate: "", deadline: "" });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg mb-20">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Add New Bill</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Bill added successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={bill.description}
            placeholder="Enter bill description..."
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (₹) *
          </label>
          <input
            name="amount"
            value={bill.amount}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleChange}
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-bold transition text-base"
        >
          {loading ? "Adding Bill..." : "ADD BILL"}
        </button>
      </form>
    </div>
  );
}
