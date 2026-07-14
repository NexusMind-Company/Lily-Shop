import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { createDispute } from '../../services/api';
import toast from 'react-hot-toast';

const DisputeModal = ({ isOpen, onClose, orderId }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description.trim()) {
      toast.error('Please select a reason and provide a description.');
      return;
    }

    setSubmitting(true);
    try {
      await createDispute(orderId, {
        reason,
        description
      });
      setSuccess(true);
      toast.success('Dispute submitted successfully.');
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
        setDescription('');
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to open dispute. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Open a Dispute
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Dispute Submitted</h4>
                <p className="text-gray-500 text-sm mt-2">
                  Our team will review your case and contact you shortly. Escrow payment is now frozen.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm">
                  Opening a dispute freezes the payment in Escrow. Please use this only if you cannot resolve the issue directly with the seller.
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Reason for Dispute</label>
                  <select 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">Select a reason...</option>
                    <option value="item_not_received">Item not received</option>
                    <option value="item_not_as_described">Item not as described</option>
                    <option value="item_damaged">Item arrived damaged</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Detailed Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about the issue..."
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !reason || !description.trim()}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DisputeModal;
