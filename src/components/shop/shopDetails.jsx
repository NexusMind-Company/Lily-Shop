import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopById } from "../../redux/shopSlice";
import LoaderSd from "../loaders/loaderSd";
import PopUp from "./popUp";
import ErrorDisplay from "../common/ErrorDisplay";
import Ratings from "./ratings";

const ShopDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    selectedShop: product,
    status,
    error,
  } = useSelector((state) => state.shops);

  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [copyPopUp, setCopyPopUp] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const [orderingProductId, setOrderingProductId] = useState(null);
  const [currentOrderQuantity, setCurrentOrderQuantity] = useState(1);

  const handleStartOrder = useCallback((productId) => {
    setOrderingProductId(productId);
    setCurrentOrderQuantity(1);
  }, []);

  const handleQuantityChange = useCallback((event) => {
    const newQuantity = parseInt(event.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      setCurrentOrderQuantity(newQuantity);
    } else if (event.target.value === "") {
      setCurrentOrderQuantity("");
    }
  }, []);

  const handleIncrementQuantity = useCallback(() => {
    setCurrentOrderQuantity((prev) =>
      typeof prev === "number" ? prev + 1 : 1
    );
  }, []);

  const handleDecrementQuantity = useCallback(() => {
    setCurrentOrderQuantity((prev) =>
      typeof prev === "number" && prev > 1 ? prev - 1 : 1
    );
  }, []);

  const handleConfirmOrder = useCallback(
    (productId) => {
      const finalQuantity =
        typeof currentOrderQuantity === "number" && currentOrderQuantity >= 1
          ? currentOrderQuantity
          : 1;
      const shopId = product ? product.id : "Unknown Shop";
      console.log(
        `Confirmed order for product ID: ${productId}, Quantity: ${finalQuantity} from shop ID: ${shopId}`
      );
      setOrderingProductId(null);
    },
    [currentOrderQuantity, product]
  );

  const handleCancelOrder = useCallback(() => {
    setOrderingProductId(null);
  }, []);

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

  const handleImageClick = () => {
    setImageEnlarged(true);
  };

  const imagepopup = () => {
    setImageEnlarged(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const toggleRatingsView = () => {
    setShowRatings((prev) => !prev);
  };

  if (status === "loading") {
    return <LoaderSd />;
  }

  if (error) {
    return <ErrorDisplay message={error} center={true} />;
  }

  if (!product) {
    return <ErrorDisplay message="Shop details not found." center={true} />;
  }

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
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
            onClick={handleImageClick}
          />
        </div>
      </div>
      {/* Enlarged Image Section */}
      {imageEnlarged && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={imagepopup}
        >
          <img
            className="max-w-[90%] max-h-[90%] rounded-lg"
            src={product.image_url}
            alt={product.name}
          />
        </div>
      )}
      <div className="flex justify-between w-full mt-5 font-poppins items-center">
        {/* Contact */}
        <p className="text-lily text-sm font-semibold font-poppins uppercase mt-5">
          Contacts: <span className="text-black">{product.owner_phone}</span>
        </p>
      </div>
      {/* Status, Message Button, and Copy Link */}{" "}
      <div className="flex justify-between w-full mt-5 font-poppins items-center">
        <div>
          <p className="font-bold font-poppins text-[13px]/[19.5px]">
            Status: <span className="text-lily">{product.owner_status}</span>
          </p>
          <p className="font-normal font-poppins text-[11px]/[16.5px]">
            Visits: <span className="text-lily">{product.visitor_count}</span>
          </p>
        </div>{" "}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <button
            onClick={toggleRatingsView}
            className={`text-${showRatings ? "white" : "black"} ${
              showRatings ? "bg-lily" : "bg-white"
            } px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 border-[1px] border-solid ${
              showRatings ? "border-lily" : "border-gray-300"
            } hover:opacity-90 transition-all duration-200 shadow-sm`}
          >
            <p>{showRatings ? "Close Rating" : "Rate Shop"}</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill={showRatings ? "white" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>

          <button className="text-black bg-white px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 border-[1px] border-solid border-gray-300">
            <p>Coming Soon</p>
            <img className="w-5" src="/message-icon.svg" alt="message-icon" />
          </button>
        </div>
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
              {orderingProductId === productItem.id ? (
                <div className="mt-2 flex flex-col gap-2 items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDecrementQuantity}
                      className="px-2 py-1 border rounded-md hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={currentOrderQuantity}
                      onChange={handleQuantityChange}
                      onBlur={() => {
                        // Ensure quantity is at least 1 on blur if empty
                        if (
                          currentOrderQuantity === "" ||
                          currentOrderQuantity < 1
                        ) {
                          setCurrentOrderQuantity(1);
                        }
                      }}
                      className="w-12 text-center border rounded-md p-1"
                      min="1"
                    />
                    <button
                      onClick={handleIncrementQuantity}
                      className="px-2 py-1 border rounded-md hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleConfirmOrder(productItem.id)}
                      className="flex-1 bg-green-500 text-white p-1.5 text-xs font-bold text-center rounded-md hover:bg-green-600 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancelOrder}
                      className="flex-1 bg-gray-300 text-black p-1.5 text-xs font-bold text-center rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleStartOrder(productItem.id)}
                  className="w-full bg-lily text-white p-1.5 text-xs font-bold text-center hover:bg-lily-dark active:bg-lily-dark transition-colors duration-200 mt-1 rounded-md"
                >
                  Order
                </button>
              )}
            </div>
          ))}
        </div>{" "}
      </div>
      {/* Ratings Component */}
      {showRatings && (
        <div className="fixed inset-0 bg-white bg-opacity-98 backdrop-blur-sm z-50 overflow-auto pt-2 pb-20 animate-fadeIn">
          <div className="max-w-4xl mx-auto px-4 relative">
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleRatingsView}
                className="bg-lily text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-opacity-90 transition-all"
                aria-label="Close ratings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />{" "}
                </svg>
              </button>{" "}
            </div>
            <Ratings shopName={product.name} />
          </div>
        </div>
      )}
      {/* PopUp Component */}
      {copyPopUp && (
        <PopUp copyPopUp={copyPopUp} handlePopUp={() => setCopyPopUp(false)} />
      )}
    </section>
  );
};

export default ShopDetails;
