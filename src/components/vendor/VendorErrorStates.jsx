import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Reusable loading skeleton for vendor dashboard pages
 */
export const VendorPageLoader = () => (
  <div className="space-y-4 animate-pulse pt-2">
    <div className="h-24 bg-gray-200  rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-20 bg-gray-200  rounded-2xl" />
      <div className="h-20 bg-gray-200  rounded-2xl" />
    </div>
    <div className="h-40 bg-gray-200  rounded-2xl" />
    <div className="h-28 bg-gray-200  rounded-2xl" />
  </div>
);

/**
 * Reusable error state for vendor dashboard pages
 */
export const VendorPageError = ({
  message = "Something went wrong",
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-red-100  flex items-center justify-center mb-4">
      <AlertTriangle size={28} className="text-red-500" />
    </div>
    <p className="text-sm font-bold text-[#111813]  mb-1">
      Oops! Something went wrong
    </p>
    <p className="text-xs text-gray-400 mb-5 max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lily text-white text-sm font-bold hover:bg-darklily transition-colors"
      >
        <RefreshCw size={14} /> Try Again
      </button>
    )}
  </div>
);

/**
 * Network/offline error state
 */
export const VendorNetworkError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100  flex items-center justify-center mb-4">
      <WifiOff size={28} className="text-gray-400" />
    </div>
    <p className="text-sm font-bold text-[#111813]  mb-1">No Connection</p>
    <p className="text-xs text-gray-400 mb-5">
      Check your internet and try again.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111813]  text-white  text-sm font-bold transition-colors"
      >
        <RefreshCw size={14} /> Retry
      </button>
    )}
  </div>
);

VendorPageError.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

VendorNetworkError.propTypes = {
  onRetry: PropTypes.func,
};
