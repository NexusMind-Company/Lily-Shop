import { useState } from "react";
import { Link } from "react-router";
import productData from "../../information/productData";

const ProductCard = () => {
  const [visibleProducts, setVisibleProducts] = useState(4);
  
  const showMoreProducts = () => {
    setVisibleProducts((prev) => prev + 4);
  };
  
  const hasMoreProducts = visibleProducts < productData.length;

  return (
    <section className="mt-10 flex flex-col px-7 gap-7 items-center max-w-3xl mx-auto">
      {/* Title */}
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-xl font-normal font-poppins">
          Welcome to <span className="text-lily">Lily Shop</span>
        </h1>
      </div>

      {/* For You Section */}
      <div className="flex flex-col items-start gap-3 w-full max-w-4xl">
        <h2 className="font-poppins font-bold text-black text-sm uppercase border-b-2 border-sun">
          For You
        </h2>
        
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {productData.slice(0, visibleProducts).map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-3 w-full text-wrap hover:shadow-lg transition-shadow duration-200"
            >
              <img
                className="rounded-lg h-[188px] w-full object-cover"
                src={product.image}
                alt={product.name}
              />
              <ul className="border-l-2 border-sun pl-2 font-inter">
                <li className="text-sm text-[#4EB75E] font-bold font-poppins uppercase">
                  {product.name}
                </li>
                <li className="text-xs text-gray-600">{product.shortDescription}</li>
                <li className="text-xs font-normal">{product.address}</li>
                <button className="text-xs underline text-lily hover:text-black">
                  View Prices
                </button>
              </ul>
            </Link>
          ))}
        </div>
        
        {/* Show More Button */}
        {hasMoreProducts && (
          <div className="w-full flex justify-center mt-6">
            <button 
              onClick={showMoreProducts}
              className="px-6 py-2 bg-lily text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 font-poppins text-sm"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCard;