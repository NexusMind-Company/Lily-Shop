import React from "react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Receipt() {
  const navigate = useNavigate();
  const { state: tx } = useLocation();

  // If no transaction data is passed, we show a fallback or redirect
  if (!tx) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-gray-200" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Receipt Found</h2>
        <p className="text-gray-500 mt-2">
          We couldn't find the details for this transaction.
        </p>
        <button
          onClick={() => navigate("/transaction-history")}
          className="mt-6 px-6 py-2 bg-lily text-white font-bold rounded-xl"
        >
          Back to History
        </button>
      </div>
    );
  }

  const formatOrdinal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month}, ${year} · ${time}`;
  };

  const txType = (tx.transaction_type || tx.type || "").toLowerCase();
  const isDeposit = txType.includes("deposit") || txType.includes("credit");
  const isWithdrawal =
    txType.includes("withdrawal") || txType.includes("debit");
  const isOrder = txType.includes("order") || txType.includes("payment");

  // Determine Main Label
  let mainStatus = "Payment Successful";
  if (isDeposit) mainStatus = "Deposit Successful";
  if (isWithdrawal) mainStatus = "Withdrawal Successful";

  return (
    <div className="min-h-screen bg-white flex flex-col font-display max-w-2xl mx-auto shadow-sm">
      {/* Header */}
      <header className="relative flex items-center justify-center p-6 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-7 h-7 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Transaction details
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-12">
        {/* Status Section */}
        <div className="flex flex-col items-center pt-10 pb-8 px-6 text-center">
          <div className="mb-4">
            <CheckCircle2 className="w-12 h-12 text-lily stroke-[2.5]" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            ₦{Math.abs(tx.amount_naira || tx.amount || 0).toLocaleString()}
          </h2>
          <p className="text-[15px] font-medium text-gray-900">
            {tx.status === "failed" || tx.status === "canceled"
              ? "Transaction Failed"
              : mainStatus}
          </p>
        </div>

        {/* Dashed Separator */}
        <div className="flex gap-2.5 px-1 mb-10 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-6 shrink-0 bg-lily rounded-full opacity-80"
            />
          ))}
        </div>

        {/* Details Sections */}
        <div className="px-6 space-y-10 text-[15px]">
          {/* Transaction Details */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">
              Transaction Details
            </h3>
            <div className="space-y-2 text-gray-900 font-medium">
              <p>Transaction ID: {tx.reference || tx.id || "N/A"}</p>
              {tx.order_no && <p>Order no: {tx.order_no}</p>}
              <p>
                Transaction Type:{" "}
                {tx.transaction_type?.replace(/_/g, " ") || "Transaction"}
              </p>
              <p>Status: {tx.status || "Completed"}</p>
              <p>Date: {formatOrdinal(tx.date || tx.created_at)}</p>
            </div>
          </section>

          {/* Payment Summary */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Payment Summary</h3>
            <div className="space-y-2 font-medium text-gray-900">
              {isDeposit && (
                <p>
                  Amount deposited: +₦
                  {(tx.amount_naira || tx.amount || 0).toLocaleString()}
                </p>
              )}

              {isWithdrawal && (
                <>
                  <p>
                    Amount withdrawn: -₦
                    {(
                      tx.base_amount ||
                      tx.amount_naira - (tx.fee || 0) ||
                      0
                    ).toLocaleString()}
                  </p>
                  <p>
                    Fees (5%): -₦
                    {(tx.fee || tx.amount_naira * 0.05 || 0).toLocaleString()}
                  </p>
                  <p>
                    Total: -₦
                    {(tx.amount_naira || tx.amount || 0).toLocaleString()}
                  </p>
                </>
              )}

              {isOrder && (
                <>
                  {tx.items_total && (
                    <p>Items Total: ₦{tx.items_total.toLocaleString()}</p>
                  )}
                  {tx.delivery_fee && (
                    <p>
                      Combined Delivery: ₦{tx.delivery_fee.toLocaleString()}
                    </p>
                  )}
                  {!tx.items_total && (
                    <p>
                      Total: ₦
                      {(tx.amount_naira || tx.amount || 0).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Bank details for Deposit or Withdrawal */}
          {(isDeposit || isWithdrawal) && (
            <section className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">
                {isDeposit ? "Payment Method" : "Withdrawal details"}
              </h3>
              <div className="space-y-2 font-medium text-gray-900">
                <p>{isDeposit ? "Bank Transfer" : "Bank Withdrawal"}</p>
                <p>Account no: {tx.account_no || "02*******42"}</p>
                <p>Name: {tx.account_name || "Adeyemi Sharon kehinde"}</p>
                <p>Bank: {tx.bank_name || "Wema Bank"}</p>
              </div>
            </section>
          )}

          {/* Order Specific Details (Items list) */}
          {isOrder && (tx.order_details || tx.items) && (
            <section className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">
                Order Details ({tx.order_details?.length || 1})
              </h3>
              <div className="space-y-6">
                {(tx.order_details || []).map((order, idx) => (
                  <div key={idx} className="space-y-2 font-medium">
                    <p>Order: {order.order_id}</p>
                    <p>Vendor: {order.vendor_name}</p>
                    <ul className="list-none space-y-1">
                      {order.items?.map((item, i) => (
                        <li key={i}>
                          • {item.name} x {item.quantity} - ₦
                          {item.price.toLocaleString()}
                        </li>
                      ))}
                    </ul>
                    <p>
                      Delivery fee - ₦{order.delivery_fee?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Delivery Address (Conditional) */}
          {isOrder && tx.delivery_address && (
            <section className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Delivery:</h3>
              <p className="font-medium text-gray-900 leading-relaxed">
                {tx.delivery_address}
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Footer Border */}
      <div className="flex gap-2.5 px-1 py-4 mt-auto overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-6 shrink-0 rounded-full opacity-80 ${i % 2 === 0 ? "bg-pink-500" : "bg-lily"}`}
          />
        ))}
      </div>
    </div>
  );
}
