import { useParams } from "react-router";
import productData from "../../information/productData";

const ProductDetails = () => {
  const { id } = useParams();
  const product = productData.find((product) => product.id === parseInt(id));

  if (!product) {
    return <div className="text-center mt-10">Product not found</div>;
  }

  return (
    <section className="mt-10 pb-10 flex flex-col items-center justify-center px-7 max-w-5xl mx-auto">
      {/* Product Title */}
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-xl font-poppins">{product.name}</h1>
      </div>

      {/* Product Image */}
      <div className="mt-7 flex items-center justify-center w-full">
        <img
          className="rounded-2xl w-full max-w-lg h-80 object-cover"
          src={product.image}
          alt={product.name}
        />
      </div>

      {/* Status & Message Button */}
      <div className="flex justify-between w-full mt-5 font-poppins items-center">
        <div>
          <p className="font-bold text-sm md:text-base">Status:</p>
          <p className="font-normal text-xs md:text-sm">Visits:</p>
        </div>
        <button className="text-black bg-white px-4 py-2 text-sm md:text-base rounded-md flex items-center gap-2 border border-gray-300">
          <p>Send Message</p>
          <img className="w-5" src="/message-icon.svg" alt="message-icon" />
        </button>
      </div>

      {/* Description Section */}
      <div className="flex flex-col gap-3 items-start w-full mt-7">
        <h2 className="font-poppins font-bold text-black text-sm md:text-lg uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Descripti</span>on
        </h2>
        <p className="font-inter font-medium text-xs md:text-sm">
          {product.shortDescription}
        </p>

        {/* Address */}
        <h2 className="font-poppins font-bold text-black text-sm md:text-lg uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Addre</span>ss
        </h2>
        <p className="font-inter font-medium text-xs md:text-sm">
          {product.address}
        </p>
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-3 items-start my-7 w-full">
        <h2 className="font-poppins font-bold text-black text-sm md:text-lg uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Produ</span>cts
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full">
          {product.productItems.map((productItem) => (
            <div
              key={productItem.id}
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
