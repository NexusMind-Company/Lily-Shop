import React from "react";

export const PostCardSkeleton = () => (
  <div className="relative w-full h-[85vh] bg-black snap-start flex-shrink-0">
    <div className="skeleton-post-media"></div>
    <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 z-20">
      <div className="flex justify-between items-end">
        <div className="flex-1 space-y-2 max-w-[calc(100%-60px)]">
          <div className="flex items-center gap-3">
            <div className="skeleton skeleton-avatar"></div>
            <div
              className="skeleton skeleton-line"
              style={{ width: "120px" }}
            ></div>
          </div>
          <div
            className="skeleton skeleton-line"
            style={{ width: "60%" }}
          ></div>
          <div
            className="skeleton skeleton-line"
            style={{ width: "30%" }}
          ></div>
          <div
            className="skeleton skeleton-line"
            style={{ width: "80%" }}
          ></div>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-icon"></div>
          <div className="skeleton skeleton-icon"></div>
        </div>
      </div>
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex space-x-3 py-2">
    <div className="skeleton skeleton-avatar-small"></div>
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 rounded-lg p-2">
        <div className="flex justify-between items-center">
          <div
            className="skeleton skeleton-line"
            style={{ width: "100px" }}
          ></div>
          <div
            className="skeleton skeleton-line"
            style={{ width: "50px" }}
          ></div>
        </div>
        <div
          className="skeleton skeleton-line mt-2"
          style={{ width: "100%" }}
        ></div>
      </div>
    </div>
  </div>
);

// Skeleton for a single suggestion item in the list
export const SearchSuggestionSkeleton = () => (
  <div className="flex items-center space-x-3 p-2">
    <div className="skeleton skeleton-avatar-small"></div>
    <div className="flex-1 space-y-2">
      <div className="skeleton skeleton-line" style={{ width: "40%" }}></div>
      <div className="skeleton skeleton-line" style={{ width: "60%" }}></div>
    </div>
  </div>
);

// Skeleton for a single item in the "Top" content grid
export const SearchGridItemSkeleton = () => (
  <div className="w-full">
    <div className="skeleton w-full h-48 rounded-lg"></div>
    <div className="skeleton skeleton-line mt-2" style={{ width: "70%" }}></div>
  </div>
);

// Skeleton for a single user item in the "Users" tab
export const SearchUserSkeleton = () => (
  <div className="flex items-center space-x-3 p-2">
    <div className="skeleton skeleton-avatar"></div>
    <div className="flex-1 space-y-2">
      <div className="skeleton skeleton-line" style={{ width: "40%" }}></div>
      <div className="skeleton skeleton-line" style={{ width: "60%" }}></div>
    </div>
  </div>
);
