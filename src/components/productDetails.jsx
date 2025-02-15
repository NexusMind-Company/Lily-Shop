import { useParams } from "react-router";
import productData from "../information/productData";

const ProductDetails = () => {
  const { id } = useParams();
  const product = productData.find((product) => product.id === parseInt(id));

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <section className="mt-10 flex flex-col items-center justify-center">
      <div className="px-7 w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-poppins">
            {product.name}
          </h1>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-5 px-7">
        <img
          className="rounded-lg h-[188px] w-[141px]"
          src={product.image}
          alt={product.name}
        />
        <ul className="border-l-2 border-[#F6AD6D] pl-1.5 font-inter">
          <li className="text-[13px]/[19.5px] text-[#4EB75E] font-bold font-poppins uppercase">
            {product.name}
          </li>
          <li className="text-[9px]/[10.89px] font-extralight">
            {product.shortDescription}
          </li>
          <li className="text-[9px]/[10.89px] font-normal">
            {product.address}
          </li>
          <li className="text-[9px]/[10.89px] font-normal">
            {product.detailedDescription}
          </li>
        </ul>
      </div>
    </section>
  );
};

export default ProductDetails;