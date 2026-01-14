import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  Plus,
  Landmark,
  ShoppingCart,
  Undo2,
  Link2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWallet } from "../../redux/walletSlice";

export default function TransactHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { recent_transactions, loading, error } = useSelector(
    (state) => state.wallet
  );

  useEffect(() => {
    dispatch(fetchWallet());
  }, [dispatch]);

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
      case "credit":
        return Plus;
      case "withdrawal":
        return Landmark;
      case "purchase":
      case "order":
        return ShoppingCart;
      case "refund":
        return Undo2;
      case "affiliate":
      case "promotion":
        return Link2;
      default:
        return ShoppingCart;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative p-4">
        <Link onClick={() => navigate(-1)}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Transaction History</h1>
      </header>

      <section className="flex-1 p-4">
        {/*  Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading transactions...</p>
          </div>
        )}

        {/*  Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <AlertCircle className="w-8 h-8 mb-2 text-red-500" />
            <p>{error}</p>
          </div>
        )}

        {/*  Transaction List */}
        {!loading && !error && recent_transactions?.length > 0 && (
          <ul className="space-y-3">
            {recent_transactions.map((tx, index) => {
              const Icon = getIcon(tx.type);
              const amountColor =
                tx.status === "successful"
                  ? "text-green-500"
                  : tx.status === "pending"
                  ? "text-orange-500"
                  : "text-gray-800";

              return (
                <li
                  key={index}
                  className="flex justify-between bg-white p-3 w-full rounded-xl"
                >
                  <div className="flex gap-3 items-center w-3/4">
                    <Icon className="w-6 h-6" />
                    <div className="flex flex-col items-start">
                      <p className="font-medium truncate max-w-[200px]">
                        {tx.title || tx.description || "Transaction"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(tx.date || tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/4 items-end">
                    <span className={`font-semibold ${amountColor}`}>
                      {tx.amount_naira
                        ? `${tx.amount_naira > 0 ? "+" : "-"}₦${Math.abs(
                            tx.amount_naira
                          ).toLocaleString()}`
                        : "₦0"}
                    </span>
                    <p className="text-xs capitalize">{tx.status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/*  Empty State */}
        {!loading && !error && recent_transactions?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-70" />
            <p>No transactions found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
