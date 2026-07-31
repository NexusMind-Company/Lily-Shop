import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Building2,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { addBankAccount } from "../../redux/walletSlice";

export default function AddBankAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const existingAccounts = useSelector((state) => state.wallet?.savedBankAccounts || []);

  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  // Nigerian banks list
  const banks = [
    { code: "044", name: "Access Bank" },
    { code: "023", name: "Citibank Nigeria" },
    { code: "063", name: "Diamond Bank" },
    { code: "050", name: "Ecobank Nigeria" },
    { code: "084", name: "Enterprise Bank" },
    { code: "070", name: "Fidelity Bank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank (FCMB)" },
    { code: "058", name: "Guaranty Trust Bank (GTBank)" },
    { code: "030", name: "Heritage Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "101", name: "Providus Bank" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "068", name: "Standard Chartered Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "033", name: "United Bank for Africa (UBA)" },
    { code: "215", name: "Unity Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "302", name: "TAJ Bank" },
    { code: "090175", name: "Rubies Microfinance Bank" },
    { code: "090267", name: "Kuda Bank" },
    { code: "50211", name: "Opay" },
    { code: "100004", name: "Opay Digital Services Limited (Opay)" },
    { code: "50515", name: "Moniepoint Microfinance Bank" },
    { code: "120001", name: "9 Payment Service Bank (9PSB)" },
  ].sort((a, b) => a.name.localeCompare(b.name));

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate account verification
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setVerifying(true);
      setError("");

      const timer = setTimeout(() => {
        setAccountName("Verified Account Holder");
        setVerified(true);
        setVerifying(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAccountName("");
      setVerified(false);
    }
  }, [accountNumber, selectedBank]);

  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setAccountNumber(value);
      setError("");
    }
  };

  const handleSave = () => {
    if (!accountNumber || accountNumber.length !== 10) {
      setError("Please enter a valid 10-digit account number");
      return;
    }
    if (!selectedBank) {
      setError("Please select a bank");
      return;
    }
    if (!verified) {
      setError("Account verification pending");
      return;
    }

    dispatch(
      addBankAccount({
        id: crypto.randomUUID(),
        bankName: selectedBank,
        accountNumber,
        accountName,
        isDefault: existingAccounts.length === 0,
      })
    );
    navigate("/bankAccountDetails");
  };

  return (
    <div className="min-h-screen bg-white font-display">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-lily-50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-lily-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-lily-50 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-lily-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-lily-700">Connect Bank</h1>
              <p className="text-sm font-bold text-gray-400">
                Add withdrawal method
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-5"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-soft border border-lily-50 p-8 space-y-8"
        >
          {/* Bank Selection */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
              Select Bank
            </label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between px-6 py-5 bg-lily-50/30 border-2 rounded-2xl transition-all text-left ${
                isOpen
                  ? "border-lily-500 ring-4 ring-lily-50"
                  : "border-lily-100 hover:border-lily-200"
              }`}
            >
              <span
                className={`font-black text-lg ${selectedBank ? "text-gray-800" : "text-gray-300"}`}
              >
                {selectedBank || "Choose your bank"}
              </span>
              <Building2
                className={`w-6 h-6 ${selectedBank ? "text-lily-500" : "text-gray-300"}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-30 w-full mt-3 bg-white border-2 border-lily-100 rounded-[2rem] shadow-glow-lg overflow-hidden"
                >
                  {/* Search Input */}
                  <div className="p-4 border-b border-lily-50">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input
                        type="text"
                        placeholder="Search banks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-10 py-4 bg-lily-50/50 border border-lily-100 rounded-xl focus:outline-none focus:border-lily-500 transition-colors font-bold"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-lily-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bank List */}
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <button
                          key={bank.code}
                          onClick={() => {
                            setSelectedBank(bank.name);
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className="w-full px-6 py-5 text-left hover:bg-lily-50 transition-all flex items-center justify-between group border-b border-lily-50 last:border-0"
                        >
                          <span className="font-bold text-gray-700 group-hover:text-lily-700">
                            {bank.name}
                          </span>
                          {selectedBank === bank.name && (
                            <CheckCircle className="w-5 h-5 text-lily-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-10 text-center text-gray-400 font-bold italic">
                        No banks match your search
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
              Account Number
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={handleAccountNumberChange}
                className="w-full px-6 py-5 bg-lily-50/30 border-2 border-lily-100 rounded-2xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-50 transition-all font-black text-2xl tracking-[0.2em] placeholder:text-gray-200"
                placeholder="0000000000"
                maxLength={10}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {verifying ? (
                  <Loader2 className="w-7 h-7 text-lily-400 animate-spin" />
                ) : verified ? (
                  <CheckCircle className="w-7 h-7 text-lily-500" />
                ) : null}
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
              <p className="text-xs font-bold text-gray-400">
                Enter exactly 10 digits
              </p>
              <p
                className={`text-xs font-black ${accountNumber.length === 10 ? "text-lily-500" : "text-gray-300"}`}
              >
                {accountNumber.length}/10
              </p>
            </div>
          </div>

          {/* Account Name */}
          <AnimatePresence>
            {(verified || verifying) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                  Account Name
                </label>
                <div
                  className={`w-full px-6 py-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    verified
                      ? "bg-lily-600 border-lily-600 text-white shadow-glow"
                      : "bg-lily-50 border-lily-100 text-lily-300"
                  }`}
                >
                  <span className="font-black text-lg uppercase tracking-tight truncate mr-4">
                    {verifying ? "Verifying..." : accountName}
                  </span>
                  {verified && (
                    <ShieldCheck className="w-6 h-6 text-white shrink-0" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Info */}
          <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5 flex items-start space-x-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs font-bold text-blue-700 leading-relaxed">
              We securely verify your account details with the Central Bank of
              Nigeria database to ensure safe withdrawals.
            </p>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="pt-4">
          <motion.button
            whileHover={verified ? { scale: 1.02 } : {}}
            whileTap={verified ? { scale: 0.98 } : {}}
            onClick={handleSave}
            disabled={!verified || verifying}
            className={`w-full py-6 rounded-3xl font-black text-xl transition-all flex items-center justify-center space-x-3 ${
              verified && !verifying
                ? "bg-lily-500 text-white shadow-glow hover:shadow-glow-lg"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {verifying ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Save Bank Account</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
