// src/pages/Receipt.jsx
import { ChevronLeft, CheckCircle2, Clock4, } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Receipt() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Default fallback data
  const receipt = state || {
    type: "refund",
    amount: 625,
    status: "Refund Successful",
    date: "12th Oct, 2025 • 2:30 PM",
    refundStatus: "Completed",
    details: {
      id: "TX2025101200482RF",
      orderNo: "#LS-20251012-00001",
      vendor: "Bloom Threads",
      item: "Flowery patterned sundress x 1",
      price: 12500,
      reason: "Item doesn’t fit",
    },
    summary: {
      refundAmount: 625,
    },
    timeline: {
      requested: "Nov 14, 2:30 PM",
      approved: "Nov 14, 4:15 PM",
      processed: "Nov 15, 3:45 PM",
    },
    method: "Lily Wallet",
  };


  // Status text and icon color
  const getStatusData = () => {
    if (receipt.type === "refund" && receipt.status.includes("Pending")) {
      return { icon: <Clock4 className="text-yellow-500 w-10 h-10 mb-2" />, color: "text-yellow-500" };
    }
    return { icon: <CheckCircle2 className="text-green-500 w-10 h-10 mb-2" />, color: "text-green-500" };
  };

  const statusData = getStatusData();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 ">
        <Link onClick={() => {navigate(-1)}}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Withdraw</h1>
      </header>

      {/* Body */}
      <div className="flex-1  py-6 text-sm text-gray-800">
        {/* Status section */}
        <div className="flex flex-col items-center mb-6 px-5">
          {statusData.icon}
          <h2 className="text-2xl font-bold">
            ₦{receipt.amount.toLocaleString()}
          </h2>
          <p className="text-gray-500">{receipt.status}</p>
        </div>

        {/* Top border */}
        <div className="border-t-4 border-dashed border-lily rounded-full mb-8" />

        {/* Transaction Details */}
        <div className="space-y-4 px-5">
          <div className="space-y-1">
            <h3 className="font-semibold mb-1">Transaction Details</h3>
            <p>Transaction ID: {receipt.details.id}</p>
            <p>
              Transaction Type:{" "}
              {receipt.type === "refund"
                ? "Order Refund"
                : receipt.type === "affiliate"
                ? "Affiliate Earnings"
                : receipt.type === "withdrawal"
                ? "Wallet Withdrawal"
                : receipt.type === "deposit"
                ? "Wallet Deposit"
                : "Order Payment"}
            </p>
            <p>
              Status:{" "}
              {receipt.status.includes("Pending") ? "Pending" : "Completed"}
            </p>
            <p>Date: {receipt.date}</p>
          </div>

          {/* Refund Receipt */}
          {receipt.type === "refund" && (
            <>
              <div className="space-y-1">
                <h3 className="font-semibold mb-1">Refund Details</h3>
                <p>Order: {receipt.details.orderNo}</p>
                <p>Vendor: {receipt.details.vendor}</p>
                <p>• {receipt.details.item} – ₦{receipt.details.price.toLocaleString()}</p>
                <p>Reason: {receipt.details.reason}</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold mb-1">Refund Summary</h3>
                <p>Amount refunded: ₦{receipt.summary.refundAmount.toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold mb-1">Refund Timeline</h3>
                <p>Requested: {receipt.timeline.requested}</p>
                <p>Approved: {receipt.timeline.approved}</p>
                <p>Processed: {receipt.timeline.processed}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Refund Method</h3>
                <p>{receipt.method}</p>
              </div>
            </>
          )}

          {/* Other receipt types */}
          {receipt.type !== "refund" && (
            <div className="space-y-1">
              <h3 className="font-semibold mb-1">Details</h3>
              <p>Additional info can be shown here depending on type.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer border */}
      <div  className="border-t-4 border-dashed border-lily rounded-full" />
    </div>
  );
}
