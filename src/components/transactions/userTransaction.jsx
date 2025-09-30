import { useMemo, useState } from "react";

const N = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n || 0);

export default function UserTransaction() {
  const now = Date.now();
  const [transactions] = useState([
    {
      id: "t1",
      title: "Wallet funding",
      description: "Funded via Card",
      direction: "in",
      amount: 12000,
      createdAt: now - 1 * 60 * 60 * 1000, // 1h ago
    },
    {
      id: "t2",
      title: "Purchase (escrow)",
      description: "Order ORD-1001 funds held in escrow",
      direction: "out",
      amount: 9500,
      createdAt: now - 6 * 60 * 60 * 1000, // 6h ago
    },
    {
      id: "t3",
      title: "Withdrawal",
      description: "Transfer to bank",
      direction: "out",
      amount: 4000,
      createdAt: now - 24 * 60 * 60 * 1000, // 1 day ago
    },
    {
      id: "t4",
      title: "Affiliate reward",
      description: "You earned a referral bonus",
      direction: "in",
      amount: 800,
      createdAt: now - 3 * 24 * 60 * 60 * 1000, // 3d ago
    },
    {
      id: "t5",
      title: "Wallet funding",
      description: "Funded via USSD",
      direction: "in",
      amount: 5000,
      createdAt: now - 5 * 24 * 60 * 60 * 1000, // 5d ago
    },
    {
      id: "t6",
      title: "Purchase (escrow)",
      description: "Order ORD-0952 funds held in escrow",
      direction: "out",
      amount: 2600,
      createdAt: now - 8 * 24 * 60 * 60 * 1000, // 8d ago
    },
    {
      id: "t7",
      title: "Wallet funding",
      description: "Funded via Bank",
      direction: "in",
      amount: 30000,
      createdAt: now - 12 * 24 * 60 * 60 * 1000, // 12d ago
    },
  ]);

  // Date range filters (YYYY-MM-DD)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  // Filter transactions by selected date range; default shows all recent (sorted desc)
  const filtered = useMemo(() => {
    setError("");
    let items = [...transactions].sort((a, b) => b.createdAt - a.createdAt);

    if (!startDate && !endDate) return items; // initial: show all recent

    let startTs = startDate ? new Date(startDate + "T00:00:00").getTime() : null;
    let endTs = endDate ? new Date(endDate + "T23:59:59").getTime() : null;

    if (startTs && endTs && startTs > endTs) {
      setError("Start date cannot be after end date");
      return items;
    }

    if (startTs) items = items.filter((t) => t.createdAt >= startTs);
    if (endTs) items = items.filter((t) => t.createdAt <= endTs);
    return items;
  }, [transactions, startDate, endDate]);

  // Quick reset
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setError("");
  };

  // Totals for displayed range
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, t) => {
        if (t.direction === "in") acc.inflow += t.amount;
        else acc.outflow += t.amount;
        return acc;
      },
      { inflow: 0, outflow: 0 }
    );
  }, [filtered]);

  return (
    <section className="max-w-4xl mx-auto px-3 sm:px-7 mt-6 sm:mt-10 mb-20 sm:mb-12">
      {/* Header */}
      <div className="rounded-2xl border border-black h-12 sm:h-16 w-full flex items-center justify-center mb-4 sm:mb-6">
        <h1 className="text-base sm:text-lg md:text-xl font-normal font-poppins px-2 text-center">
          My <span className="text-lily">Transactions</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-4 bg-white mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Filter by Date</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="flex flex-col">
            <label className="text-xs text-ash mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-ash mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 pl-4 border-2 rounded-full hover:border-lily outline-none"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto px-4 py-2 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white text-center"
            >
              Clear
            </button>
          </div>
        </div>
        {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm">
          <span className="text-ash">Showing: {filtered.length} transaction(s)</span>
          <span className="text-green-700">Inflow: {N(totals.inflow)}</span>
          <span className="text-red-700">Outflow: {N(totals.outflow)}</span>
        </div>
      </div>

      {/* Transactions List */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-4 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Recent Transactions</h2>
        <div className="divide-y">
          {filtered.length === 0 && (
            <div className="text-sm text-ash py-2">No transactions in the selected period.</div>
          )}
          {filtered.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-ash truncate">{t.description}</div>
                <div className="text-[11px] text-ash mt-1">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div className={`text-sm font-semibold ${t.direction === "in" ? "text-green-700" : "text-red-700"}`}>
                {t.direction === "in" ? "+" : "-"}{N(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
