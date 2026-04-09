import React from "react";
import { motion } from "framer-motion";

// Shimmer animation component
const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
);

export const PostCardSkeleton = () => (
  <div className="relative w-full h-[98vh] bg-black snap-start shrink-0 overflow-hidden">
    <div className="skeleton-post-media relative">
      <Shimmer />
    </div>
    <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 z-dropdown">
      <div className="flex justify-between items-end">
        <div className="flex-1 space-y-3 max-w-[calc(100%-60px)]">
          <div className="flex items-center gap-3">
            <div className="skeleton skeleton-avatar relative overflow-hidden">
              <Shimmer />
            </div>
            <div
              className="skeleton skeleton-line h-4 relative overflow-hidden"
              style={{ width: "120px" }}
            >
              <Shimmer />
            </div>
          </div>
          <div
            className="skeleton skeleton-line h-3 relative overflow-hidden"
            style={{ width: "60%" }}
          >
            <Shimmer />
          </div>
          <div
            className="skeleton skeleton-line h-3 relative overflow-hidden"
            style={{ width: "30%" }}
          >
            <Shimmer />
          </div>
          <div
            className="skeleton skeleton-line h-3 relative overflow-hidden"
            style={{ width: "80%" }}
          >
            <Shimmer />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="skeleton skeleton-icon relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="skeleton skeleton-icon relative overflow-hidden">
            <Shimmer />
          </div>
          <div className="skeleton skeleton-icon relative overflow-hidden">
            <Shimmer />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex space-x-3 py-3">
    <div className="skeleton skeleton-avatar-small relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <div
            className="skeleton skeleton-line h-3 relative overflow-hidden"
            style={{ width: "100px" }}
          >
            <Shimmer />
          </div>
          <div
            className="skeleton skeleton-line h-3 relative overflow-hidden"
            style={{ width: "50px" }}
          >
            <Shimmer />
          </div>
        </div>
        <div
          className="skeleton skeleton-line h-3 relative overflow-hidden"
          style={{ width: "100%" }}
        >
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for a single suggestion item in the list
export const SearchSuggestionSkeleton = () => (
  <div className="flex items-center space-x-3 p-3">
    <div className="skeleton skeleton-avatar-small relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="flex-1 space-y-2">
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "40%" }}>
        <Shimmer />
      </div>
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "60%" }}>
        <Shimmer />
      </div>
    </div>
  </div>
);

// Skeleton for a single item in the "Top" content grid
export const SearchGridItemSkeleton = () => (
  <div className="w-full">
    <div className="skeleton w-full h-48 rounded-xl relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="skeleton skeleton-line h-4 mt-3 relative overflow-hidden" style={{ width: "70%" }}>
      <Shimmer />
    </div>
  </div>
);

// Skeleton for a single user item in the "Users" tab
export const SearchUserSkeleton = () => (
  <div className="flex items-center space-x-3 p-3">
    <div className="skeleton skeleton-avatar relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="flex-1 space-y-2">
      <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "40%" }}>
        <Shimmer />
      </div>
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "60%" }}>
        <Shimmer />
      </div>
    </div>
  </div>
);

// Feed skeleton with multiple posts
export const FeedSkeleton = ({ count = 3 }) => (
  <div className="h-screen overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

// Card skeleton for general use
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-card">
    <div className="flex items-center gap-4 mb-4">
      <div className="skeleton skeleton-avatar relative overflow-hidden">
        <Shimmer />
      </div>
      <div className="flex-1 space-y-2">
        <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "60%" }}>
          <Shimmer />
        </div>
        <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "40%" }}>
          <Shimmer />
        </div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "100%" }}>
        <Shimmer />
      </div>
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "90%" }}>
        <Shimmer />
      </div>
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "70%" }}>
        <Shimmer />
      </div>
    </div>
  </div>
);

// List item skeleton
export const ListItemSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark rounded-xl">
    <div className="skeleton w-12 h-12 rounded-lg relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="flex-1 space-y-2">
      <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "70%" }}>
        <Shimmer />
      </div>
      <div className="skeleton skeleton-line h-3 relative overflow-hidden" style={{ width: "50%" }}>
        <Shimmer />
      </div>
    </div>
    <div className="skeleton w-8 h-8 rounded-full relative overflow-hidden">
      <Shimmer />
    </div>
  </div>
);

// Profile header skeleton
export const ProfileHeaderSkeleton = () => (
  <div className="bg-white dark:bg-surface-dark">
    <div className="skeleton w-full h-48 relative overflow-hidden">
      <Shimmer />
    </div>
    <div className="px-4 pb-4">
      <div className="flex items-end gap-4 -mt-12 mb-4">
        <div className="skeleton w-24 h-24 rounded-full border-4 border-white dark:border-surface-dark relative overflow-hidden">
          <Shimmer />
        </div>
        <div className="flex-1 space-y-2 pb-2">
          <div className="skeleton skeleton-line h-6 relative overflow-hidden" style={{ width: "60%" }}>
            <Shimmer />
          </div>
          <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "40%" }}>
            <Shimmer />
          </div>
        </div>
      </div>
      <div className="flex gap-6 mb-4">
        <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "80px" }}>
          <Shimmer />
        </div>
        <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "80px" }}>
          <Shimmer />
        </div>
        <div className="skeleton skeleton-line h-4 relative overflow-hidden" style={{ width: "80px" }}>
          <Shimmer />
        </div>
      </div>
    </div>
  </div>
);

export default {
  PostCardSkeleton,
  CommentSkeleton,
  SearchSuggestionSkeleton,
  SearchGridItemSkeleton,
  SearchUserSkeleton,
  FeedSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  ProfileHeaderSkeleton,
};
