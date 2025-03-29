import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopById } from "../../redux/shopSlice";
import LoaderSd from "../loaders/loaderSd";
import PopUp from "./popUp";

const ShopDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    selectedShop: product,
    status,
    error,
  } = useSelector((state) => state.shops);

  const [copyPopUp, setCopyPopUp] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchShopById(id));
  }, [id, dispatch]);

  const handleCopyLink = () => {
    const shopLink = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(shopLink).then(() => {
      setCopyPopUp(true);
      setTimeout(() => setCopyPopUp(false), 2000);
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (status === "loading") {
    return <LoaderSd />;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-10">Product not found</div>;
  }

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      {/* Product Title */}
      <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center text-center px-2.5">
        <h1 className="text-xl font-normal font-poppins">{product.name}</h1>
      </div>

      {/* Product Image */}
      <div className="mt-7 flex flex-col items-center justify-center w-full relative">
        <button
          className="cursor-pointer flex items-center gap-0.5 text-right font-poppins text-xs font-medium absolute -top-6 right-0"
          onClick={handleCopyLink}
        >
          <p>Copy</p>
          <img className="w-4" src="/copy.svg" alt="copy-icon" />
        </button>
        <div className="w-full aspect-[16/9] relative overflow-hidden rounded-2xl">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-[4px] border-solid border-lily border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
          <img
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            src={product.image_url}
            alt={product.name}
            onLoad={handleImageLoad}
          />
        </div>
      </div>

      {/* Status, Message Button, and Copy Link */}
      <div className="flex justify-between w-full mt-5 font-poppins items-center">
        <div>
          <p className="font-bold font-poppins text-[13px]/[19.5px]">
            Status: <span className="text-lily">{product.owner_status}</span>
          </p>
          <p className="font-normal font-poppins text-[11px]/[16.5px]">
            Visits: <span className="text-lily">{product.visitor_count}</span>
          </p>
        </div>

        <button className="text-black bg-white px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 border-[1px] border-solid border-gray-300">
          <p>Coming Soon</p>
          <img className="w-5" src="/message-icon.svg" alt="message-icon" />
        </button>
      </div>

      {/* Description and Address Section */}
      <div className="flex flex-col gap-4 items-start mt-6 w-full">
        <div className="w-full">
          <h2 className="font-poppins font-bold text-black text-sm uppercase mb-2">
            <span className="border-b-[2px] border-solid border-[#F6AD6D]">
              Descripti
            </span>
            on
          </h2>
          <p className="font-inter text-gray-700 text-sm leading-6">
            {product.description}
          </p>
        </div>

        <div className="w-full">
          <h2 className="font-poppins font-bold text-black text-sm uppercase mb-2">
            <span className="border-b-[2px] border-solid border-[#F6AD6D]">
              Addre
            </span>
            ss
          </h2>
          <p className="font-inter text-gray-700 text-sm leading-6">
            {product.address}
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-3 items-start my-5 w-full">
        <h2 className="font-poppins font-bold text-black text-xs/[18px] uppercase">
          <span className="border-b-[2px] border-solid border-[#F6AD6D]">
            Produ
          </span>
          cts
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {product.products.map((productItem) => (
            <div
              key={productItem.name}
              className="flex flex-col gap-2 w-full text-wrap"
            >
              <img
                className="w-full h-40 md:h-48 rounded-lg object-cover"
                src={productItem.image_url}
                alt={productItem.name}
              />
              <ul className="border-l-[2px] border-solid border-[#F6AD6D] pl-2 font-inter">
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
        <p className="text-lily text-sm font-semibold font-poppins uppercase mt-5">
          Contacts: <span className="text-black">{product.owner_phone}</span>
        </p>
      </div>

      {/* PopUp Component */}
      {copyPopUp && (
        <PopUp copyPopUp={copyPopUp} handlePopUp={() => setCopyPopUp(false)} />
      )}
    </section>
  );
};

export default ShopDetails;
