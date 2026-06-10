import React from "react";

export const PostCardSkeleton = () => (
  <div className="relative w-full h-full bg-black snap-start shrink-0">
    <div className="skeleton-post-media"></div>
    <div className="absolute bottom-3 left-0 right-0 p-4 pb-20 z-[5]">
      <div className="flex justify-between items-end">
        <div className="flex-1 space-y-3 max-w-[calc(100%-60px)]">
          <div className="flex items-center gap-3">
            <div className="skeleton-avatar"></div>
            <div className="skeleton skeleton-line" style={{ width: "100px" }}></div>
          </div>
          <div className="skeleton skeleton-line" style={{ width: "55%" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "35%" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "75%" }}></div>
        </div>
        <div className="flex flex-col items-center space-y-5 pr-1">
          <div className="skeleton skeleton-icon"></div>
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

const MessageListRowSkeleton = () => (
  <div className="flex items-center justify-between p-3 rounded-xl">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div
        className="skeleton rounded-full shrink-0"
        style={{ width: 48, height: 48 }}
      ></div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="skeleton skeleton-line" style={{ width: "120px" }}></div>
          <div
            className="skeleton skeleton-line"
            style={{ width: "50px", height: 8 }}
          ></div>
        </div>
        <div className="skeleton skeleton-line" style={{ width: "70%" }}></div>
      </div>
    </div>
    <div
      className="skeleton skeleton-line shrink-0"
      style={{ width: "24px", height: 8 }}
    ></div>
  </div>
);

export const MessageListSkeleton = ({ count = 4 }) => (
  <section className="px-4 pb-24 overflow-y-auto h-full">
    <div className="space-y-3 pb-20">
      {Array.from({ length: count }).map((_, i) => (
        <MessageListRowSkeleton key={i} />
      ))}
    </div>
  </section>
);

export const ProfileHeaderSkeleton = () => (
  <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12 bg-white">
    <div className="md:hidden flex items-center justify-between py-3 border-b border-gray-100 mb-2">
      <div className="skeleton rounded-full" style={{ width: 28, height: 28 }}></div>
      <div className="skeleton skeleton-line" style={{ width: "120px" }}></div>
      <div className="skeleton rounded-full" style={{ width: 24, height: 24 }}></div>
    </div>

    <header className="flex flex-col md:flex-row md:items-start md:gap-20 py-6 md:py-12">
      <div className="flex justify-start md:justify-center md:w-1/3 mb-4 md:mb-0">
        <div className="skeleton rounded-full w-20 h-20 md:w-36 md:h-36"></div>
      </div>
      <div className="md:w-2/3 flex flex-col gap-5">
        <div className="skeleton skeleton-line" style={{ width: "160px" }}></div>
        <div className="hidden md:flex gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-line" style={{ width: "70px" }}></div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="skeleton skeleton-line" style={{ width: "140px" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "100px" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "85%" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "60%" }}></div>
        </div>
      </div>
    </header>

    <div className="md:hidden flex justify-around py-4 border-t border-b border-gray-100 text-center mb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="skeleton skeleton-line" style={{ width: "24px" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "48px", height: 8 }}></div>
        </div>
      ))}
    </div>

    <div className="flex flex-row gap-2.5 w-full py-4 border-t md:border-t-0 border-gray-100 mb-4">
      <div className="skeleton flex-1 rounded-lg" style={{ height: 48 }}></div>
      <div className="skeleton flex-1 rounded-lg" style={{ height: 48 }}></div>
      <div className="skeleton rounded-lg" style={{ width: 52, height: 48 }}></div>
    </div>

    <div className="flex md:justify-center border-t border-gray-200">
      <div className="flex-1 md:flex-none py-4 md:mx-10 flex justify-center">
        <div className="skeleton skeleton-line" style={{ width: "60px" }}></div>
      </div>
      <div className="flex-1 md:flex-none py-4 md:mx-10 flex justify-center">
        <div className="skeleton skeleton-line" style={{ width: "80px" }}></div>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-1 md:gap-0 my-2 pt-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton aspect-square"></div>
      ))}
    </div>
  </div>
);

export const AddressListSkeleton = ({ count = 3 }) => (
  <div className="space-y-8">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-start gap-4">
        <div
          className="skeleton rounded-full mt-1 shrink-0"
          style={{ width: 24, height: 24 }}
        ></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton skeleton-line" style={{ width: "40%" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "80%" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "65%" }}></div>
        </div>
        <div className="skeleton rounded mt-1" style={{ width: 20, height: 20 }}></div>
      </div>
    ))}
  </div>
);

export const SubscriptionCardSkeleton = () => (
  <div className="rounded-2xl bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="skeleton rounded-xl" style={{ width: 44, height: 44 }}></div>
        <div className="space-y-2">
          <div className="skeleton skeleton-line" style={{ width: "140px" }}></div>
          <div className="skeleton skeleton-line" style={{ width: "80px", height: 8 }}></div>
        </div>
      </div>
      <div className="skeleton rounded-full" style={{ width: 60, height: 24 }}></div>
    </div>
  </div>
);
