import {
  ChevronLeft,
  Plus,
  SendHorizontal,
  Landmark,
  ShoppingCart,
  Undo2,
  Link2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet } from "../../redux/walletSlice";

export default function Wallet() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get token and wallet state
  const token = useSelector((state) => state.auth?.user_data?.token?.access);
  const { balance_naira, recent_transactions, loading, error } = useSelector(
    (state) => state.wallet || {}
  );

  // Fetch wallet after login
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    dispatch(fetchWallet());
  }, [dispatch, token, navigate]);

  // Handle callback status (Paystack verification)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");

    if (status === "success") {
      alert("✅ Deposit successful! Your wallet has been updated.");
    } else if (status === "failed") {
      alert("❌ Payment verification failed. Please try again.");
    } else if (status === "missing_reference") {
      alert("⚠️ Invalid callback: missing payment reference.");
    }

    // Clean URL after showing alert
    if (status) {
      navigate("/wallet", { replace: true });
    }
  }, [location.search, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="relative px-4 pb-4">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </button>
        <h1 className="text-lg font-semibold text-center">Lily Wallet</h1>
      </header>

      {/* Balance */}
      <section className="px-4 py-2 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500">Loading wallet...</p>
        ) : error ? (
          <p className="text-center text-red-500">
            {error || "Failed to load wallet."}
          </p>
        ) : (
          <div>
            <p className="text-sm font-semibold pb-2">Available Balance</p>
            <h2 className="text-3xl font-semibold pb-2">
              ₦{balance_naira?.toLocaleString() || 0}
            </h2>
            <p className="text-sm font-semibold pb-2 text-gray-600">
              Pending: ₦
              {recent_transactions
                ?.filter((t) => t.status === "Pending")
                ?.reduce((sum, t) => sum + t.amount, 0)
                ?.toLocaleString() || 0}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 w-full">
          <Link to="/deposit" className="w-1/2">
            <button className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-lily text-white font-medium">
              <Plus className="w-7 h-7" /> Deposit
            </button>
          </Link>
          <Link to="/withdraw" className="w-1/2">
            <button className="flex items-center justify-center gap-2 w-full py-2 rounded-full border border-lily text-lily font-medium">
              <SendHorizontal className="w-7 h-7" /> Withdraw
            </button>
          </Link>
        </div>
      </section>

      {/* Transaction History */}
      <section className="flex-1 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">History</h2>
          <Link to="/transaction-history">
            <button className="text-sm text-lily">View all</button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Fetching transactions...</p>
        ) : recent_transactions?.length > 0 ? (
          <ul className="space-y-3">
            {recent_transactions.slice(0, 5).map((tx, index) => {
              const isCredit = tx.type === "credit" || tx.amount > 0;
              const iconMap = {
                deposit: Plus,
                withdrawal: Landmark,
                refund: Undo2,
                purchase: ShoppingCart,
                affiliate: Link2,
              };
              const Icon = iconMap[tx.category] || Plus;

              return (
                <li
                  key={index}
                  className="flex justify-between bg-white p-3 w-full border rounded-lg"
                >
                  <div className="flex gap-2 items-center w-3/4">
                    <Icon className="w-7 h-7" />
                    <div className="flex flex-col items-start">
                      <p className="font-medium">
                        {tx.description?.slice(0, 30) || "Transaction"}...
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/4 items-end">
                    <span
                      className={`font-semibold ${
                        isCredit ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₦
                      {Math.abs(tx.amount || 0).toLocaleString()}
                    </span>
                    <p
                      className={`text-xs ${
                        tx.status === "Pending"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {tx.status?.toLowerCase() || "completed"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No transactions yet.</p>
        )}
      </section>
    </div>
  );
}
