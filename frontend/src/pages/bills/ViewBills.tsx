import { useEffect, useState } from "react";
import { getAllBills } from "../../services/api";

export default function ViewBills() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllBills();
      setBills(Array.isArray(data) ? data : (data as any).bills || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bills");
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        All Bills
      </h1>

      {/* Loading */}
      {loading && (
        <div className="text-gray-600">Loading bills...</div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-600 font-medium mb-4">{error}</div>
      )}

      {/* If no bills */}
      {!loading && bills.length === 0 && (
        <div className="text-gray-600">No bills found.</div>
      )}

      {/* Table */}
      {!loading && bills.length > 0 && (
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
              {bills.map((bill) => (
                <tr key={bill.billId} className="hover:bg-gray-100 transition">
                  <td className="py-3 px-4 border-b font-medium">{bill.billId}</td>
                  <td className="py-3 px-4 border-b">{bill.description}</td>
                  <td className="py-3 px-4 border-b font-semibold text-green-600">₹{parseFloat(bill.amount).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                  <td className="py-3 px-4 border-b">{bill.billDate}</td>
                  <td className="py-3 px-4 border-b">{bill.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
