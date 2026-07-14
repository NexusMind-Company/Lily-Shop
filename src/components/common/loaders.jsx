import React from "react";
import { Loader2 } from "lucide-react";

/**
 * PageLoader: Full screen loader for page transitions and Suspense fallbacks.
 */
export const PageLoader = () => (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lily font-semibold tracking-wide animate-pulse">Loading...</p>
    </div>
  </div>
);

/**
 * SectionLoader: Centered loader for components and sections.
 */
export const SectionLoader = ({ text = "Loading..." }) => (
  <div className="w-full py-12 flex flex-col items-center justify-center">
    <div className="w-8 h-8 border-3 border-lily border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-gray-500 text-sm font-medium">{text}</p>
  </div>
);

/**
 * ButtonLoader: Inline loader for buttons with mutating actions.
 * Usage: <button disabled={isLoading}> {isLoading ? <ButtonLoader /> : "Submit"} </button>
 */
export const ButtonLoader = ({ text = "Please wait..." }) => (
  <span className="flex items-center justify-center gap-2">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span>{text}</span>
  </span>
);

/**
 * Skeleton Loader variants
 */
export const SkeletonRect = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`}></div>
);

export const SkeletonCircle = ({ className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-full ${className}`}></div>
);

export const SkeletonText = ({ className = "", lines = 1 }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`bg-gray-200 animate-pulse h-4 rounded-md ${
          i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
        }`}
      ></div>
    ))}
  </div>
);
