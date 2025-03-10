import { useParams } from "react-router";
import productData from "../../information/productData";

const ProductDetails = () => {
  const { id } = useParams();
  const product = productData.find((product) => product.id === parseInt(id));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <section className="mt-10 flex flex-col md:items-center md:justify-center px-7">
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-xl font-poppins">{product.name}</h1>
      </div>
      <div className="mt-7 flex items-center justify-center">
        <img
          className="rounded-2xl h-[311px] w-full object-fit"
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="flex justify-between w-full">
        <div>
          <p className="font-bold font-poppins">Status:</p>
          <p className="font-normal font-poppins">
            Visits:
          </p>
        </div>
        <button className="flex items-center justify-center bg-white gap-3 font-poppins font-medium px-1 rounded-2xl">
          Chat with Lily
          <img src="/lily.svg" alt="lily-icon" />
        </button>
      </div>

      <div className="flex flex-col gap-3 items-start mt-5">
        <h2 className="font-poppins font-bold text-black text-x/[18px] uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Descripti</span>on
        </h2>
        <p className="font-inter font-medium">
          {product.shortDescription}
        </p>
        <h2 className="font-poppins font-bold text-black text-x/[18px] uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Addre</span>ss
          <br />
        </h2>
        <p className="font-inter font-medium">
          {product.address}
        </p>
      </div>

      <div className="flex flex-col gap-3 items-start my-5">
        <h2 className="font-poppins font-bold text-black text-x/[18px] uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Produ</span>cts
          <br />
        </h2>
        <div className="flex flex-wrap justify-between gap-5">
          {product.productItems.map((productItem) => {
            return (
              <div
                key={productItem.id}
                className="h-20 w-[200px] bg-blue-400 py-2"
              >
                <ul className="border-l-2 border-[#F6AD6D] pl-1.5 font-inter">
                  <li className="text-[13px]/[19.5px] text-[#4EB75E] font-bold font-poppins uppercase">
                    {productItem.name}
                  </li>
                  <li className="text-[9px]/[10.89px] font-extralight">
                    {productItem.description}
                  </li>
                  <li className="text-[9px]/[10.89px] font-normal">
                    {productItem.price}
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="font-medium font-poppins text-[13px]/[19.5px] text-lily">
        Contact: <span className="text-black">{product.contact}</span>
      </p>
    </section>
  );
};

export default ProductDetails;
