import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShops } from "../../store/shopSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { shops, status, error } = useSelector((state) => state.shops);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchShops());
    }
  }, [status, dispatch]);

  // Find the product by ID
  const product = shops.find((shop) => shop.id === parseInt(id));

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Product not found</div>;
  }

  return (
    <section className="mt-10 pb-10 flex flex-col items-center justify-center px-7 max-w-5xl mx-auto">
      {/* Product Title */}
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-xl font-normal font-poppins">{product.name}</h1>
      </div>

      {/* Product Image */}
      <div className="mt-7 flex items-center justify-center w-full">
        <img
          className="rounded-2xl h-[311px] w-[100%]"
          src={product.image}
          alt={product.name}
        />
      </div>

      {/* Status & Message Button */}
      <div className="flex justify-between w-full mt-5 font-poppins items-center">
        <div>
          <p className="font-bold font-poppins text-[13px]/[19.5px]">Status:</p>
          <p className="font-normal font-poppins text-[11px]/[16.5px]">
            Visits:
          </p>
        </div>
        <button className="text-black bg-white px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 border border-gray-300">
          <p>Send Message</p>
          <img className="w-5" src="/message-icon.svg" alt="message-icon" />
        </button>
      </div>

      {/* Description and Address Section */}
      <div className="flex flex-col gap-4 items-start mt-6 w-full">
        {/* Description Section */}
        <div className="w-full">
          <h2 className="font-poppins font-bold text-black text-sm uppercase mb-2">
            <span className="border-b-2 border-[#F6AD6D]">Descripti</span>on
          </h2>
          <p className="font-inter text-gray-700 text-sm leading-6">
            {product.description}
          </p>
        </div>

        {/* Address Section */}
        <div className="w-full">
          <h2 className="font-poppins font-bold text-black text-sm uppercase mb-2">
            <span className="border-b-2 border-[#F6AD6D]">Addre</span>ss
          </h2>
          <p className="font-inter text-gray-700 text-sm leading-6">
            {product.address}
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-3 items-start my-5 w-full">
        <h2 className="font-poppins font-bold text-black text-xs/[18px] uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Produ</span>cts
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {product.products.map((productItem) => (
            <div
              key={productItem.name}
              className="flex flex-col gap-2 w-full text-wrap"
            >
              <img
                className="w-full h-40 md:h-48 rounded-lg object-cover"
                src={productItem.image}
                alt={productItem.name}
              />
              <ul className="border-l-2 border-[#F6AD6D] pl-2 font-inter">
                <li className="text-xs md:text-sm text-black font-semibold">
                  {productItem.name}
                </li>
                <li className="text-xs md:text-sm font-normal text-lily">
                  ₦<span className="text-black">{productItem.price}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <p className="text-lily text-sm md:text-base font-semibold font-poppins uppercase mt-5">
          Contacts: <span className="text-black">{product.contact}</span>
        </p>
      </div>
    </section>
  );
};

export default ProductDetails;
