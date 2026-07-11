export const ProfileSkeleton = () => (
  <div className="w-full max-w-full mx-auto min-h-screen pb-10 px-4 md:px-12 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-start md:gap-20 py-6 md:py-12 border-b-0 md:border-b border-gray-200">
      <div className="flex justify-center md:w-1/3 mb-4 md:mb-0">
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gray-200"></div>
      </div>
      <div className="md:w-2/3 flex flex-col items-center md:items-start gap-4 w-full">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-12 bg-gray-200 rounded-2xl w-full mt-4"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1 md:gap-0 mt-6">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200"></div>
      ))}
    </div>
  </div>
);

export const ShopSkeleton = () => (
  <div className="w-full animate-pulse">
    <div className="h-48 md:h-64 bg-gray-200 w-full"></div>
    <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-2xl border-4 border-white"></div>
      <div className="mt-4 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
      ))}
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="w-full animate-pulse space-y-4 p-4 max-w-2xl mx-auto">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl">
        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="w-full animate-pulse p-4 md:p-8 max-w-4xl mx-auto space-y-6 mt-10">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
    <div className="space-y-4">
      <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
      <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
      <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
      <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
    </div>
  </div>
);

export const GridSkeleton = () => (
  <div className="grid grid-cols-3 gap-1 md:gap-0 mt-2">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
    ))}
  </div>
);
