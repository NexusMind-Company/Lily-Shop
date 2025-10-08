import { Link } from "react-router-dom";

export default function UserWallet() {
  // Local demo state (design-first; no Redux wiring)

  return (
    <section className="max-w-4xl mx-auto px-3 sm:px-7 mt-6 sm:mt-10 mb-20 sm:mb-12">
      {/* Header */}
      <div className="rounded-2xl border border-black h-12 sm:h-16 w-full flex items-center justify-center mb-4 sm:mb-6">
        <h1 className="text-base sm:text-lg md:text-xl font-normal font-poppins px-2 text-center">
          My <span className="text-lily">Wallet</span>
        </h1>
      </div>

      {/* Balance Card */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <div className="text-xs sm:text-sm text-ash">Available Balance</div>
        <div className="text-xl sm:text-2xl md:text-3xl font-semibold mt-1">N10,000</div>
      </div>

      <div className="mb-5 flex gap-2.5">
        <Link to="/topup">
          <button className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-black bg-black text-white text-center">
            Top Up
          </button>
        </Link>
        <Link to="/withdraw">
          <button className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white text-center">
            Withdraw
          </button>
        </Link>
      </div>

      {/* Transaction History */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 bg-white">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold mb-3">Transaction History</h2>
        <Link to="/transactions" className="mt-4 flex justify-end">
          <button className="py-2 px-4 outline-none bg-black text-white rounded-4xl hover:bg-black hover:text-white text-center">
            View All
          </button>
        </Link>
      </div>
    </section>
  );
}
