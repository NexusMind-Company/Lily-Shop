import { useState } from "react";
import { Link } from "react-router-dom";

const N = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

export default function UserWallet() {
  // Local demo state (design-first; no Redux wiring)
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const addTx = (tx) => {
    setTransactions((prev) => [{ id: `${Date.now()}-${Math.random()}`, ...tx }, ...prev]);
  };

  // Forms state
  const [fundAmount, setFundAmount] = useState(5000);
  const [fundMethod, setFundMethod] = useState("card");
  const [fundError, setFundError] = useState("");
  const [fundSuccess, setFundSuccess] = useState("");

  const [buyOrderId, setBuyOrderId] = useState("ORD-" + Math.floor(Math.random() * 9000 + 1000));
  const [buyAmount, setBuyAmount] = useState(5000);
  const [buySellerId, setBuySellerId] = useState("");
  const [buyError, setBuyError] = useState("");
  const [buySuccess, setBuySuccess] = useState("");

  const [wdAmount, setWdAmount] = useState(2000);
  const [wdError, setWdError] = useState("");
  const [wdSuccess, setWdSuccess] = useState("");

  const onFund = () => {
    setFundError("");
    setFundSuccess("");
    const amt = Number(fundAmount);
    if (!amt || amt <= 0) {
      setFundError("Enter a valid amount");
      return;
    }
    setBalance((b) => b + amt);
    addTx({
      type: "fund",
      direction: "in",
      amount: amt,
      title: "Wallet funding",
      description: `Funded via ${fundMethod.toUpperCase()}`,
      createdAt: Date.now(),
    });
    setFundSuccess(`Wallet funded with ${N(amt)} via ${fundMethod.toUpperCase()}`);
  };

  const onBuy = () => {
    setBuyError("");
    setBuySuccess("");
    const amt = Number(buyAmount);
    if (!amt || amt <= 0) {
      setBuyError("Enter a valid amount");
      return;
    }
    if (!buySellerId) {
      setBuyError("Enter seller id");
      return;
    }
    if (balance < amt) {
      setBuyError("Insufficient balance");
      return;
    }
    setBalance((b) => b - amt);
    addTx({
      type: "purchase_hold",
      direction: "out",
      amount: amt,
      title: "Purchase (escrow)",
      description: `Order ${buyOrderId} funds held in escrow`,
      createdAt: Date.now(),
    });
    setBuySuccess(`Placed ${N(amt)} in escrow for ${buyOrderId}`);
    setBuyOrderId("ORD-" + Math.floor(Math.random() * 900000 + 100000));
  };

  const onWithdraw = () => {
    setWdError("");
    setWdSuccess("");
    const amt = Number(wdAmount);
    if (!amt || amt <= 0) {
      setWdError("Enter a valid amount");
      return;
    }
    if (balance < amt) {
      setWdError("Insufficient balance");
      return;
    }
    setBalance((b) => b - amt);
    addTx({
      type: "withdraw",
      direction: "out",
      amount: amt,
      title: "Withdrawal",
      description: `Transfer to bank`,
      createdAt: Date.now(),
    });
    setWdSuccess(`Withdrawal of ${N(amt)} initiated`);
  };

  return (
    <section className="w-full mx-auto px-3 sm:px-7 mt-6 sm:mt-10 mb-20 sm:mb-12">
      {/* Header */}
      <div className="rounded-2xl border border-black h-12 sm:h-16 w-full flex items-center justify-center mb-4 sm:mb-6">
        <h1 className="text-base sm:text-lg md:text-xl font-normal font-poppins px-2 text-center">
          My <span className="text-lily">Wallet</span>
        </h1>
      </div>

      {/* Balance Card */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <div className="text-xs sm:text-sm text-ash">Available Balance</div>
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{N(balance)}</div>
      </div>

      {/* Add Funds */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Add Funds</h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {[
            { key: "card", label: "Card" },
            { key: "bank", label: "Bank" },
            { key: "ussd", label: "USSD" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setFundMethod(m.key)}
              className={`px-4 py-2 rounded-full border ${
                fundMethod === m.key
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-black"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="number"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="w-full sm:w-48 p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            placeholder="Amount"
            min={0}
          />
          <button
            onClick={onFund}
            className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-black bg-black text-white text-center">
            Fund Wallet
          </button>
          {fundError && <span className="text-red-600 text-sm">{fundError}</span>}
          {fundSuccess && <span className="text-green-700 text-sm">{fundSuccess}</span>}
        </div>
      </div>

      {/* Buy Products (escrow deduction) */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Buy Product</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
          <input
            value={buyOrderId}
            onChange={(e) => setBuyOrderId(e.target.value)}
            className="w-full p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            placeholder="Order ID"
          />
          <input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="w-full p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            placeholder="Amount"
            min={0}
          />
          <input
            value={buySellerId}
            onChange={(e) => setBuySellerId(e.target.value)}
            className="w-full p-2 pl-4 border-2 rounded-full hover:border-lily outline-none sm:col-span-2"
            placeholder="Seller ID"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={onBuy}
            className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-black bg-black text-white text-center">
            Pay from Wallet (Escrow)
          </button>
          {buyError && <span className="text-red-600 text-sm">{buyError}</span>}
          {buySuccess && <span className="text-green-700 text-sm">{buySuccess}</span>}
        </div>
        <p className="text-xs text-ash mt-2">
          Your payment will be held in escrow until delivery is confirmed or 48 hours elapse.
        </p>
      </div>

      {/* Withdraw */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Withdraw to Bank</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="number"
            value={wdAmount}
            onChange={(e) => setWdAmount(e.target.value)}
            className="w-full sm:w-48 p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            placeholder="Amount"
            min={0}
          />
          <button
            onClick={onWithdraw}
            className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white text-center">
            Withdraw
          </button>
          {wdError && <span className="text-red-600 text-sm">{wdError}</span>}
          {wdSuccess && <span className="text-green-700 text-sm">{wdSuccess}</span>}
        </div>
      </div>

      {/* Transaction History */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Transaction History</h2>
        <div className="divide-y">
          {transactions.length === 0 && (
            <div className="text-sm text-ash py-2">No transactions yet.</div>
          )}
          {transactions.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-ash truncate">{t.description}</div>
              </div>
              <div
                className={`text-sm font-semibold ${
                  t.direction === "in" ? "text-green-700" : "text-red-700"
                }`}>
                {t.direction === "in" ? "+" : "-"}
                {N(t.amount)}
              </div>
            </div>
          ))}
        </div>
        <Link to="/transactions" className="mt-4 flex justify-end">
          <button className="py-2 px-4 outline-none bg-black text-white rounded-4xl hover:bg-black hover:text-white text-center">
            View All
          </button>
        </Link>
      </div>
    </section>
  );
}
