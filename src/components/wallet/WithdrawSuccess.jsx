import React from "react";
import { CheckCircle2, Download, Share2, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function WithdrawSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const transaction = location.state || {
    amount: "0.00",
    fee: "0.00",
    accountNumber: "XXXXXXXXXX",
    accountName: "Unknown",
    bankName: "Unknown Bank",
    date: new Date().toLocaleString(),
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log("Downloading receipt...");
  };

  const handleShareReceipt = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: "Withdrawal Receipt",
        text: `Withdrawal of ₦${transaction.amount} successful`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/wallet")}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Wallet</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-success/20 to-success/5 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-20 h-20 text-success" />
              </div>
              {/* Animated ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 border-4 border-success rounded-full"
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Withdrawal Successful!
            </h1>
            <p className="text-gray-600">
              Your withdrawal is being processed
            </p>
          </motion.div>

          {/* Amount Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl shadow-card p-6 mb-6"
          >
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Amount Sent</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-lily-600 to-purple-600 bg-clip-text text-transparent">
                ₦{parseFloat(transaction.amount).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Bank</span>
                <span className="font-semibold text-gray-800">{transaction.bankName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Number</span>
                <span className="font-semibold text-gray-800">{transaction.accountNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Name</span>
                <span className="font-semibold text-gray-800">{transaction.accountName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Transaction Fee</span>
                <span className="font-semibold text-error">₦{parseFloat(transaction.fee).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-semibold text-gray-800">
                  {new Date(transaction.date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {/* Download Receipt */}
            <button
              onClick={handleDownloadReceipt}
              className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>

            {/* Share Receipt */}
            <button
              onClick={handleShareReceipt}
              className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Receipt</span>
            </button>

            {/* Back to Wallet */}
            <Link to="/wallet">
              <button className="w-full bg-gradient-to-r from-lily-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                Back to Wallet
              </button>
            </Link>
          </motion.div>

          {/* Info Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-blue-50 border-2 border-blue-100 rounded-2xl p-4"
          >
            <p className="text-sm text-blue-800 text-center leading-relaxed">
              <strong>Note:</strong> It may take up to 24 hours for the funds to
              reflect in your bank account depending on your bank's processing time.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
