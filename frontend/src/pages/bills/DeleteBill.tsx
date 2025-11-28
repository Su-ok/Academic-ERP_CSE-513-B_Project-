import { useState } from "react";
import { deleteBill, getBillById } from "../../services/api";

export default function DeleteBill() {
  const [billId, setBillId] = useState("");
  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSearchBill = async (e: any) => {
    e.preventDefault();
    
    if (!billId.trim()) {
      setError("Bill ID is required");
      return;
    }

    setSearchLoading(true);
    setError("");
    setBill(null);
    setConfirmDelete(false);

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

  const handleDeleteBill = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await deleteBill((bill as any).billId);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setBill(null);
        setBillId("");
        setConfirmDelete(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to delete bill");
      setConfirmDelete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Delete Bill</h1>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Bill deleted successfully!
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
                placeholder="Enter bill ID to delete..."
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

      {/* Bill Preview and Delete Confirmation */}
      {bill && (
        <div className="space-y-6">
          
          {/* Bill Details Card */}
          <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bill Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bill ID</p>
                <p className="text-lg font-semibold text-gray-800">{(bill as any).billId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-lg font-semibold text-blue-600">₹{parseFloat((bill as any).amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bill Date</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date((bill as any).billDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadline</p>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date((bill as any).deadline).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-gray-800 mt-2">{(bill as any).description}</p>
            </div>
          </div>

          {/* Confirmation Message */}
          {confirmDelete && (
            <div className="border border-red-400 bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 font-semibold mb-4">
                Are you sure you want to delete this bill? This action cannot be undone.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleDeleteBill}
              disabled={loading}
              className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition ${
                confirmDelete
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-500 hover:bg-red-600"
              } disabled:bg-gray-400`}
            >
              {loading ? "Deleting..." : confirmDelete ? "Confirm Delete" : "Delete Bill"}
            </button>
            <button
              type="button"
              onClick={() => {
                setBill(null);
                setBillId("");
                setError("");
                setConfirmDelete(false);
              }}
              className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
