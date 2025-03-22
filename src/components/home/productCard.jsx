import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops } from "../../store/shopSlice";
import Loader from "../loader";

const ProductCard = () => {
  const dispatch = useDispatch();
  const { shops, status, error } = useSelector((state) => state.shops);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      {/* Title */}
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
          Welcome to <span className="text-lily">Lily Shops</span>
        </h1>
      </div>

      {/* For You Section */}
      <div className="flex flex-col items-start gap-3 w-full">
        <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-2 border-sun">
          For You
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
          {shops.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-full h-40 md:h-48">
                <img
                  className="rounded-lg h-full w-full object-cover"
                  src={product.image_url}
                  alt={product.name}
                />
              </div>
              <ul className="border-l-2 border-sun pl-2 font-inter">
                <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase truncate">
                  {product.name}
                </li>
                <li className="text-xs text-gray-600 line-clamp-2">
                  {product.description}
                </li>
                <li className="text-xs font-normal truncate">
                  {product.address}
                </li>
                <button className="text-xs underline text-lily hover:text-black">
                  View Prices
                </button>
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCard;
