import { useSelector } from "react-redux";

// Profile Body Component
const ProfileShops = () => {
  // Get user's shops from Redux profile slice
  const shops = useSelector((state) => state.profile.shops || []);

  return (
    <div className="w-full flex flex-wrap gap-[5px] justify-between py-1">
      {shops.length === 0 ? (
        <div className="w-full text-center py-10 text-gray-400">
          No shops yet.
        </div>
      ) : (
        shops.map((shop) => (
          <div
            key={shop.id}
            className="p-2 w-[32%] relative lg:w-[33%] rounded-lg overflow-hidden flex flex-col"
          >
            {shop.image_url ? (
              <img
                src={shop.image_url}
                alt={shop.name}
                className="w-full h-[200px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gray-200">
                No Image
              </div>
            )}
            <div className="flex-1 flex flex-col py-2 justify-between">
              <h3 className="font-bold text-base text-lily mb-1 uppercase" title={shop.name}>
                {shop.name}
              </h3>
              <p
                className="text-sm text-gray-600 mb-1 line-clamp-2"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                title={shop.description}
              >
                {shop.description || "No description"}
              </p>
              <p
                className="text-sm text-black mb-1 line-clamp-2"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
                title={shop.address}
              >
                {shop.address || "No address"}
              </p>
              <a className="text-gray-600 text-sm underline" href="">
                view prices
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProfileShops;