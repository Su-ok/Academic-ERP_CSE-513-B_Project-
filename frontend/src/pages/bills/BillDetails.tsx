import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBillById } from "../../services/api";

export default function BillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const data = await getBillById(billId as any);
        setBill(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bill details");
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg mb-4">
          Bill not found
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const calculateDaysLeft = (deadline: string | undefined) => {
    if (!deadline) return { text: "-", color: "gray" };
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return { 
        text: `Overdue by ${Math.abs(daysLeft)} days`, 
        color: "red" 
      };
    } else if (daysLeft === 0) {
      return { 
        text: "Due Today", 
        color: "yellow" 
      };
    } else {
      return { 
        text: `${daysLeft} days remaining`, 
        color: "green" 
      };
    }
  };

  const statusInfo = calculateDaysLeft(bill.deadline);
  const statusColors: any = {
    red: "bg-red-50 border-red-200 text-red-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    green: "bg-green-50 border-green-200 text-green-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800"
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bill Details
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-medium"
        >
          Go Back
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">

        {/* Bill ID Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">BILL ID</p>
          <p className="text-3xl font-bold text-blue-600">#{bill.billId}</p>
        </div>

        {/* Description Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">DESCRIPTION</p>
          <p className="text-lg text-gray-800 leading-relaxed">
            {bill.description}
          </p>
        </div>

        {/* Amount Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-600 mb-2">AMOUNT</p>
          <p className="text-4xl font-bold text-green-600">
            ₹{parseFloat(bill.amount).toLocaleString("en-IN", { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">BILL DATE</p>
            <p className="text-lg text-gray-800">
              {formatDate(bill.billDate)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">PAYMENT DEADLINE</p>
            <p className="text-lg text-gray-800">
              {formatDate(bill.deadline)}
            </p>
          </div>
        </div>

        {/* Status Section */}
        <div className={`p-4 rounded-lg border-2 ${statusColors[statusInfo.color]}`}>
          <p className="text-sm font-semibold text-gray-600 mb-1">STATUS</p>
          <p className="text-xl font-bold">{statusInfo.text}</p>
        </div>

      </div>

      {/* Additional Info */}
      {bill.createdAt && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <p>
            Created: {new Date(bill.createdAt).toLocaleString("en-IN")}
          </p>
          {bill.updatedAt && (
            <p>
              Last updated: {new Date(bill.updatedAt).toLocaleString("en-IN")}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate(`/employee/bills/update?billId=${bill.billId}`)}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Edit Bill
        </button>
        <button
          onClick={() => navigate(`/employee/bills/delete?billId=${bill.billId}`)}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Delete Bill
        </button>
      </div>

    </div>
  );
}
