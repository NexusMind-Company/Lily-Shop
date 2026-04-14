import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Building2, Plus, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BANK_STORAGE_KEY = "lily_wallet_bank_accounts";

const loadBankAccounts = () => {
  try {
    return JSON.parse(sessionStorage.getItem(BANK_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveBankAccounts = (accounts) => {
  sessionStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(accounts));
};

export default function BankAccountDetails() {
  const navigate = useNavigate();
  const [savedAccounts, setSavedAccounts] = useState(() => loadBankAccounts());

  const [selectedAccount, setSelectedAccount] = useState(
    savedAccounts.find((acc) => acc.isDefault)?.id || savedAccounts[0]?.id
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleSetDefault = (accountId) => {
    setSavedAccounts((accounts) => {
      const nextAccounts = accounts.map((acc) => ({
        ...acc,
        isDefault: acc.id === accountId,
      }));
      saveBankAccounts(nextAccounts);
      return nextAccounts;
    });
    setSelectedAccount(accountId);
  };

  const handleDelete = (accountId) => {
    setSavedAccounts((accounts) => {
      const nextAccounts = accounts.filter((acc) => acc.id !== accountId);
      if (nextAccounts.length > 0 && !nextAccounts.some((acc) => acc.isDefault)) {
        nextAccounts[0] = { ...nextAccounts[0], isDefault: true };
      }
      saveBankAccounts(nextAccounts);
      setSelectedAccount(
        nextAccounts.find((acc) => acc.isDefault)?.id || nextAccounts[0]?.id || null,
      );
      return nextAccounts;
    });
    setShowDeleteConfirm(null);
  };

  const handleProceedToWithdraw = () => {
    const account = savedAccounts.find((acc) => acc.id === selectedAccount);
    navigate("/withdraw/confirm", {
      state: {
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex flex-col">
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
                Bank Accounts
              </h1>
              <p className="text-sm text-gray-600">
                {savedAccounts.length} account{savedAccounts.length !== 1 ? "s" : ""}{" "}
                saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full space-y-4">
        {/* Saved Accounts */}
        {savedAccounts.length > 0 ? (
          savedAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl p-5 shadow-card transition-all ${
                selectedAccount === account.id
                  ? "ring-2 ring-lily-500 shadow-card-hover"
                  : "hover:shadow-card-hover"
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Radio Button */}
                <button
                  onClick={() => setSelectedAccount(account.id)}
                  className="flex-shrink-0 mt-1"
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedAccount === account.id
                        ? "border-lily-500 bg-lily-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAccount === account.id && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </button>

                {/* Account Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-lily-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-lily-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{account.bankName}</p>
                        {account.isDefault && (
                          <span className="inline-flex items-center space-x-1 text-xs font-semibold text-success">
                            <CheckCircle className="w-3 h-3" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="font-semibold text-gray-700 mb-1">
                    {account.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">{account.accountName}</p>

                  {/* Actions */}
                  <div className="flex items-center space-x-4 mt-3">
                    {!account.isDefault && (
                      <button
                        onClick={() => handleSetDefault(account.id)}
                        className="text-sm font-semibold text-lily-600 hover:text-lily-700 transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(account.id)}
                      className="text-sm font-semibold text-error hover:text-red-700 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Confirmation */}
              <AnimatePresence>
                {showDeleteConfirm === account.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <p className="text-sm text-gray-700 mb-3">
                      Are you sure you want to remove this account?
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="flex-1 px-4 py-2 bg-error text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      >
                        Yes, Remove
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No bank accounts saved</p>
            <p className="text-sm text-gray-500 mb-4">
              Add a bank account to start withdrawing
            </p>
          </motion.div>
        )}

        {/* Add New Account Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: savedAccounts.length * 0.1 + 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/addBankAccount")}
          className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-lily-500 hover:text-lily-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Add New Bank Account</span>
        </motion.button>
      </div>

      {/* Withdraw Button */}
      {savedAccounts.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceedToWithdraw}
              disabled={!selectedAccount}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                selectedAccount
                  ? "bg-gradient-to-r from-lily-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Proceed to Withdraw
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
