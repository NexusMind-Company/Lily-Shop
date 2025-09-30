import { useState } from "react";
import UserWallet from "./userWallet";
import VendorWallet from "./vendorWallet";

export default function Wallet() {
  const [tab, setTab] = useState("buyer");

  return (
    <>
      <section className="w-full mx-auto max-w-5xl px-3 sm:px-7 mt-6 sm:mt-10 mb-20 sm:mb-16">
        {/* Page Header */}
        <div className="rounded-2xl border border-black h-12 sm:h-16 w-full flex items-center justify-center mb-4 sm:mb-6">
          <h1 className="text-base sm:text-lg md:text-xl font-normal font-poppins px-2 text-center">
            <span className="text-black">Wallet</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="w-full rounded-2xl border border-black bg-white p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTab("buyer")}
              className={`w-full sm:w-auto text-center px-4 py-2 rounded-full border ${
                tab === "buyer" ? "bg-black text-white border-black" : "bg-white text-black border-black"
              }`}
            >
              Buyer Wallet
            </button>
            <button
              onClick={() => setTab("vendor")}
              className={`w-full sm:w-auto text-center px-4 py-2 rounded-full border ${
                tab === "vendor" ? "bg-black text-white border-black" : "bg-white text-black border-black"
              }`}
            >
              Vendor Wallet
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-ash mt-2">
            Buyer: fund wallet, pay via escrow, withdraw. Vendor: confirm delivery to receive payout (minus 5%) and view sales summary.
          </p>
        </div>

        {/* Tab Content */}
        {tab === "buyer" ? <UserWallet /> : <VendorWallet />}
      </section>
    </>
  );
}
