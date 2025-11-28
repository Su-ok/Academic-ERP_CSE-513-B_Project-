import { useState } from "react";
import { getStudentBills } from "../../services/api";

export default function StudentBillsView() {
  const [rollNumber, setRollNumber] = useState("");
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: any) => {
    e.preventDefault();

    if (!rollNumber.trim()) {
      setError("Roll number is required");
      return;
    }

    setLoading(true);
    setError("");
    setBills([]);
    setSearched(true);

    try {
      const data = await getStudentBills(rollNumber);
      // StudentBillResponse has flat structure with billDescription, billAmount, etc.
      if (Array.isArray(data)) {
        // Map StudentBillResponse to display format
        const mappedBills = data.map((item: any) => ({
          billId: item.billId,
          description: item.billDescription || "",
          amount: item.billAmount || 0,
          billDate: item.billDate || "",
          deadline: item.deadline || ""
        }));
        setBills(mappedBills);
      } else {
        setBills([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch bills");
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Student Bills by Roll Number</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            placeholder="Enter roll number..."
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 font-semibold transition"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bills...</p>
          </div>
        </div>
      )}

      {searched && !loading && bills.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No bills found for this roll number.</p>
        </div>
      )}

      {bills.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="py-3 px-4 border-b">Bill ID</th>
                <th className="py-3 px-4 border-b">Description</th>
                <th className="py-3 px-4 border-b">Amount</th>
                <th className="py-3 px-4 border-b">Bill Date</th>
                <th className="py-3 px-4 border-b">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, index) => (
                <tr key={bill.billId || index} className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4 border-b font-medium">{bill.billId || "N/A"}</td>
                  <td className="py-3 px-4 border-b">{bill.description || "N/A"}</td>
                  <td className="py-3 px-4 border-b font-semibold text-green-600">
                    ₹{bill.amount ? parseFloat(bill.amount.toString()).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2}) : "0.00"}
                  </td>
                  <td className="py-3 px-4 border-b">{bill.billDate || "N/A"}</td>
                  <td className="py-3 px-4 border-b">{bill.deadline || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700">
              <span className="font-semibold">Total Bills: {bills.length}</span>
              {bills.length > 0 && (
                <span className="ml-4">| <span className="font-semibold">Total Amount: ₹{bills.reduce((sum, bill) => sum + (bill.amount ? parseFloat(bill.amount.toString()) : 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})}</span></span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
