import { ChevronLeft, Plus, SendHorizontal, Landmark, ShoppingCart, Undo2, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Wallet() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="relative p-4 border-2 border-gray-300">
        <ChevronLeft className="absolute w-8 h-8" />
        <h1 className="text-lg font-semibold text-center">Lily Wallet</h1>
      </header>

      {/* Balance Section */}
      <section className="px-4 py-2 space-y-3">
        <div>
          <p className="text-sm font-semibold pb-2 ">Available Balance</p>
          <h2 className="text-3xl font-semibold pb-2">₦30,000</h2>
          <p className="text-sm font-semibold pb-2">Pending: ₦4,200</p>
        </div>

        <div className="flex gap-4 w-full">
          <Link to="/deposit" className="w-1/2"><button className="flex items-center justify-center gap-2 w-full flex-1 py-2 rounded-full bg-lily text-white font-medium">
            <Plus className="w-7 h-7" /> Deposit
          </button></Link>
          <Link to="/withdraw" className="w-1/2"><button className="flex items-center justify-center gap-2 w-full flex-1 py-2 rounded-full border border-lily text-lily font-medium">
            <SendHorizontal className="w-7 h-7" /> Withdraw
          </button></Link>
        </div>
      </section>

      {/* Transaction History */}
      <section className="flex-1 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">History</h2>
          <Link to="/transaction-history" ><button className="text-sm text-lily">View all</button></Link>
        </div>

        <ul className="space-y-3">
          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <Plus className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Deposit from Adeyemi Isaac".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">7th Oct, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-green-500 font-semibold">+₦30,000</span>
              <p className="text-xs text-gray-600">successful</p>
            </div>
          </li>

          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <Landmark className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Withdrawal to 802789*** Opay".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">2nd Oct, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-red-500 font-semibold">-₦10,000</span>
              <p className="text-xs text-red-600">Pending</p>
            </div>
          </li>

          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <ShoppingCart className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Order Payment #LS-4573473837".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">27th sep, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-green-500 font-semibold">-₦10,000</span>
              <p className="text-xs text-gray-600">successful</p>
            </div>
          </li>

          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <Undo2 className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Refund for order #LS-4573473837".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">29th sep, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-green-500 font-semibold">+₦10,000</span>
              <p className="text-xs text-gray-600">successful</p>
            </div>
          </li>

          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <Link2 className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Affiliate earnings from GadgetCity".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">29th sep, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-green-500 font-semibold">+₦100</span>
              <p className="text-xs text-gray-600">successful</p>
            </div>
          </li>

          <li className="flex justify-between bg-white p-3 w-full ">
            <div className="flex gap-2 items-center w-3/4">
              <Landmark className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <p className="font-medium">{"Withdrawal to 802789*** Opay".slice(0, 23)}...</p>
                <p className="text-xs text-gray-600">2nd Oct, 2025</p>
              </div>
            </div>
            <div className="flex flex-col w-1/4 items-end">
              <span className="text-red-500 font-semibold">-₦10,000</span>
              <p className="text-xs text-red-600">Pending</p>
            </div>
          </li>

          
        </ul>
      </section>
    </div>
  );
}
