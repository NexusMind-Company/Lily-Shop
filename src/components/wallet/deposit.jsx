import { ChevronLeft, CreditCard, Banknote } from "lucide-react";
import { Link } from "react-router-dom";


export default function Deposit() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 border-2 border-gray-300">
        <Link to="/wallet">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Deposit</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        <div className="border border-gray-300 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-lily" />
              <span className="font-medium">Card</span>
            </div>
            <span className="text-xs ">Default</span>
          </div>
          <p className="text-sm ">5399 **** **** 49</p>
          <p className="text-sm ">Exp: 09/26 &nbsp; </p>
          <p className="text-sm ">CVV: ***</p>
          <button className="text-xs text-red-500">+ Add new card</button>
        </div>

        <div className="border rounded-xl p-4 flex items-center gap-2 border-gray-300">
          <Banknote className="w-5 h-5 text-lily" />
          <span className="font-medium">Bank Transfer</span>
        </div>
      </div>

      <div className="p-4">
        <button className="w-full py-3 rounded-full bg-lily text-white font-medium">
          Proceed
        </button>
      </div>
    </div>
  );
}
