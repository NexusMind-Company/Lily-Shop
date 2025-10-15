import { ChevronLeft, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Withdraw() {
  const [hasBankAccount] = useState(false); // Remove unused setter
  const navigate = useNavigate();

  const handleWithdrawClick = () => {
    navigate(hasBankAccount ? "/bankAccountDetails" : "/addBankAccount");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 border-2 border-gray-300">
        <Link to="/transaction-history">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Withdraw</h1>
      </header>

      <section className="flex-1 p-4">
        <button
          onClick={handleWithdrawClick}
          className="border rounded-xl p-4 flex items-center gap-2 font-medium w-full hover:bg-gray-50">
          <Landmark /> Withdraw to Bank Transfer
        </button>
      </section>
    </div>
  );
}
