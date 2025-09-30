import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const N = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

export default function VendorWallet() {
  const [balance, setBalance] = useState(0);
  const [sales, setSales] = useState({ totalReceived: 0, orders: 0 });
  const [transactions, setTransactions] = useState([]);
  const [escrows, setEscrows] = useState([
    {
      id: "esc-1",
      orderId: "ORD-1001",
      amount: 9500,
      status: "held",
      releaseAt: Date.now() + 36 * 60 * 60 * 1000, // +36h
    },
    {
      id: "esc-2",
      orderId: "ORD-1002",
      amount: 8000,
      status: "released",
      releaseAt: Date.now() - 2 * 60 * 60 * 1000, // -2h
    },
  ]);

  const addTx = (tx) => {
    setTransactions((prev) => [{ id: `${Date.now()}-${Math.random()}`, ...tx }, ...prev]);
  };

  // Withdraw form state
  const [wdAmount, setWdAmount] = useState(3000);
  const [wdError, setWdError] = useState("");
  const [wdSuccess, setWdSuccess] = useState("");

  const vendorEscrows = useMemo(() => escrows, [escrows]);

  const onConfirmDelivery = (escrowId) => {
    setEscrows((prev) => {
      const next = prev.map((e) => {
        if (e.id !== escrowId || e.status !== "held") return e;
        return { ...e, status: "released", releasedAt: Date.now() };
      });
      // compute vendor payout for this hold and update balance/sales/transactions once
      const hold = prev.find((e) => e.id === escrowId);
      if (hold && hold.status === "held") {
        const gross = Number(hold.amount) || 0;
        const vendorNet = Math.round(gross * 0.95 * 100) / 100; // minus 5%
        setBalance((b) => b + vendorNet);
        setSales((s) => ({ totalReceived: s.totalReceived + vendorNet, orders: s.orders + 1 }));
        addTx({
          type: "payout",
          direction: "in",
          amount: vendorNet,
          title: "Product sale",
          description: `Order ${hold.orderId} payout (gross ${N(gross)} − fee ${N(gross * 0.05)})`,
          createdAt: Date.now(),
        });
      }
      return next;
    });
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
          Vendor <span className="text-lily">Wallet</span>
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="rounded-2xl border border-black p-3 sm:p-4 bg-white">
          <div className="text-xs sm:text-sm text-ash">Available Balance</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">{N(balance)}</div>
        </div>
        <div className="rounded-2xl border border-black p-3 sm:p-4 bg-white sm:col-span-2">
          <div className="text-xs sm:text-sm text-ash">Sales Summary</div>
          <div className="text-sm sm:text-base md:text-lg font-medium mt-1">
            {N(sales.totalReceived)} received for {sales.orders} orders
          </div>
          <p className="text-[11px] sm:text-xs text-ash mt-1">
            Payouts reflect net earnings after a 5% platform fee on each order.
          </p>
        </div>
      </div>

      {/* Escrows for this vendor */}
      <div className="rounded-2xl border border-black p-3 sm:p-4 bg-white mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Your Escrows</h2>
        <div className="space-y-2">
          {vendorEscrows.length === 0 && (
            <div className="text-sm text-ash">No escrow holds for your products yet.</div>
          )}
          {vendorEscrows.map((e) => (
            <div
              key={e.id}
              className="border rounded-xl p-2 sm:p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-sm">
                <div>
                  Order: <span className="font-mono">{e.orderId}</span>
                </div>
                <div>
                  Amount: <span className="font-semibold">{N(e.amount)}</span>
                </div>
                <div>
                  Status: <span className="font-semibold capitalize">{e.status}</span>
                </div>
                <div className="text-ash">Release at: {new Date(e.releaseAt).toLocaleString()}</div>
              </div>
              {e.status === "held" ? (
                <button
                  onClick={() => onConfirmDelivery(e.id)}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border-2 border-black bg-black text-white">
                  Confirm Delivery → Release Funds
                </button>
              ) : (
                <div className="text-green-700 text-sm font-medium">Released</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Withdraw */}
      <div className="rounded-2xl border border-black p-3 sm:p-4 bg-white mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Transfer to Bank</h2>
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

      {/* Recent Activity */}
      <div className="rounded-2xl border border-black p-3 sm:p-4 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Recent Activity</h2>
        <div className="divide-y">
          {transactions.length === 0 && (
            <div className="text-sm text-ash py-2">No transactions yet.</div>
          )}
          {transactions.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0 pr-2">
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
