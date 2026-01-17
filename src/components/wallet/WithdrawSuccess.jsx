import { CheckCircle2, ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function WithdrawSuccess() {
  const { state } = useLocation();
  const transaction = state || {
    amount: "0.00",
    fee: "0.00",
    accountNumber: "XXXXXXXXXX",
    date: new Date().toLocaleString(),
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 ">
        <Link onClick={() => {navigate(-1)}}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Withdrawal Successful</h1>
      </header>

    <section className="p-4 w-full">
      <div className="flex-1 flex flex-col items-center justify-center">
        <CheckCircle2 className="w-50 h-50 text-lily mb-4" />
        <p className="text-2xl font-bold mb-4">₦{transaction.amount}</p>

        <div className="w-full max-w-sm space-y-4">
          <div className="flex justify-between">
            <span>Account Number:</span>
            <span>{transaction.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span >Transaction Fee:</span>
            <span>₦{transaction.fee}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{transaction.date}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Link
          to="/wallet"
          className="w-full bg-lily text-white py-3 rounded-lg font-medium block text-center">
          Back to wallet
        </Link>
      </div>
      </section>
    </div>
  );
}
