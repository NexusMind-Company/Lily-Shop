import { Link } from "react-router-dom";

export default function Withdraw() {
  return (
    <section className="max-w-4xl mx-auto px-3 sm:px-7 mt-6 sm:mt-10 mb-20 sm:mb-12">
      {/* Header */}
      <div className="rounded-2xl border border-black h-12 sm:h-16 w-full flex items-center justify-center mb-4 sm:mb-6">
        <h1 className="text-base sm:text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Make a <span className="text-lily">Withdrawal</span>
        </h1>
      </div>

      {/* Withdrawal Form */}
      <div className="w-full rounded-2xl border border-black p-3 sm:p-5 mb-4 sm:mb-6 bg-white">
        <div className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm ">Amount to Withdraw</label>
            <input
              type="number"
              className="w-full text-xl sm:text-2xl border-b border-ash focus:border-black outline-none py-1"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm">Account Details</label>
            <input
              type="text"
              className="w-full text-base sm:text-lg border-b border-ash focus:border-black outline-none py-1"
              placeholder="Bank account information"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col lg:w-full sm:flex-row gap-2.5">
        <button className="w-full lg:w-1/2 px-5 py-3 rounded-full border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors">
          Confirm Withdrawal
        </button>
        <Link to="/wallet" className="w-full lg:w-1/2 sm:w-auto">
          <button className="w-full px-5 py-3 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white transition-colors">
            Back to Wallet
          </button>
        </Link>
      </div>
    </section>
  );
}
