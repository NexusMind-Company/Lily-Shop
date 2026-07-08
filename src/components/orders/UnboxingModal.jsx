import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Video, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getUnboxingUrl, confirmUnboxing } from '../../services/api';
import toast from 'react-hot-toast';

const UnboxingModal = ({ isOpen, onClose, orderId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type.startsWith('video/')) {
        setFile(selected);
      } else {
        toast.error('Please select a valid video file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      // 1. Get presigned URL
      const { upload_url, file_key } = await getUnboxingUrl(orderId);
      
      // 2. Upload to S3 directly
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Confirm upload with backend
      await confirmUnboxing(orderId, { file_key });
      
      setSuccess(true);
      toast.success('Unboxing video uploaded successfully!');
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFile(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
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
              <Video className="w-5 h-5 text-purple-600" />
              Upload Unboxing Video
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Upload Complete!</h4>
                <p className="text-gray-500 text-sm mt-2">Your video has been securely saved.</p>
              </div>
            ) : (
              <>
                <div className="bg-purple-50 text-purple-800 p-4 rounded-xl flex gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Recording your unboxing provides strong evidence in case the item arrives damaged or incorrect.</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  {file ? (
                    <div className="text-purple-600 font-medium break-all">{file.name}</div>
                  ) : (
                    <div>
                      <p className="font-semibold text-gray-700">Click to browse or drag video</p>
                      <p className="text-gray-400 text-xs mt-1">MP4, WebM up to 50MB</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Video
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnboxingModal;
