import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, Search, X, CheckCircle, AlertCircle, Building2, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AddBankAccount() {
  const navigate = useNavigate();
  
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
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Simulate account verification (replace with actual API call)
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      setVerifying(true);
      setError("");
      
      // Simulate API call
      setTimeout(() => {
        // Mock verification
        setAccountName("John Doe Sample"); // Replace with actual API response
        setVerified(true);
        setVerifying(false);
      }, 1500);
    } else {
      setAccountName("");
      setVerified(false);
    }
  }, [accountNumber, selectedBank]);

  const handleAccountNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    if (value.length <= 10) {
      setAccountNumber(value);
      setError("");
    }
  };

  const handleSave = () => {
    // Validation
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

    // TODO: Save to backend
    console.log("Saving bank account:", {
      accountNumber,
      bankName: selectedBank,
      accountName,
    });

    // Navigate to confirmation or back
    navigate("/bankAccountDetails", {
      state: {
        accountNumber,
        bankName: selectedBank,
        accountName,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                Add Bank Account
              </h1>
              <p className="text-sm text-gray-600">Enter your bank details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-error/10 border-2 border-error/20 rounded-2xl p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-card p-6 space-y-6"
        >
          {/* Account Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={handleAccountNumberChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lily-500 focus:ring-4 focus:ring-lily-100 transition-all"
                placeholder="Enter 10-digit account number"
                maxLength={10}
              />
              {accountNumber.length === 10 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {verifying ? (
                    <Loader2 className="w-5 h-5 text-lily-600 animate-spin" />
                  ) : verified ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-error" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {accountNumber.length}/10 digits
            </p>
          </div>

          {/* Bank Selection */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bank Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-left"
              >
                <span className={selectedBank ? "text-gray-800" : "text-gray-500"}>
                  {selectedBank || "Select your bank"}
                </span>
                <Building2 className="w-5 h-5 text-gray-400" />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search banks..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-lily-500 transition-colors text-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bank List */}
                    <div className="max-h-60 overflow-y-auto">
                      {filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.code}
                            onClick={() => {
                              setSelectedBank(bank.name);
                              setIsOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <span className="text-gray-800">{bank.name}</span>
                            {selectedBank === bank.name && (
                              <CheckCircle className="w-4 h-4 text-lily-600" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No banks found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Account Name (Auto-filled after verification) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={accountName}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                placeholder={verifying ? "Verifying..." : "Auto-filled after verification"}
              />
              {verified && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              This will be automatically filled once we verify your account
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>Verification:</strong> We'll verify your account details
                  with your bank. This usually takes a few seconds.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={verified ? { scale: 1.02 } : {}}
          whileTap={verified ? { scale: 0.98 } : {}}
          onClick={handleSave}
          disabled={!verified || verifying}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            verified && !verifying
              ? "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {verifying ? "Verifying Account..." : "Save Bank Account"}
        </motion.button>
      </div>
    </div>
  );
}