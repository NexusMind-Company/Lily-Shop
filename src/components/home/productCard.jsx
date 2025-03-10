import { Link } from "react-router";
import productData from "../../information/productData";

const ProductCard = () => {
  return (
    <section className="mt-[40px] flex flex-col px-7 gap-7 md:items-center md:justify-center">
      <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Welcome to <span className="text-lily">Lily Shop</span>
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs/[18px]">
          <span className="border-b-2 border-sun">For Y</span>ou
          <br />
        </h2>
        <div className="flex justify-center w-full">
  <div className="grid grid-cols-2 gap-5 place-items-center w-full max-w-xs sm:max-w-md">
    {productData.map((product) => (
      <Link
        to={`/product/${product.id}`}
        key={product.id}
        className="flex flex-col gap-5 w-full text-wrap"
      >
        <img
          className="rounded-lg h-[188px] w-full"
          src={product.image}
          alt={product.name}
        />
        <ul className="border-l-2 border-sun pl-1.5 font-inter">
          <li className="text-[13px]/[19.5px] text-[#4EB75E] font-bold font-poppins uppercase">
            {product.name}
          </li>
          <li className="text-[9px]/[10.89px] font-extralight">
            {product.shortDescription}
          </li>
          <li className="text-[9px]/[10.89px] font-normal">
            {product.address}
          </li>
          <button className=" text-[8px]/[9.68px] underline">
            View Prices
          </button>
        </ul>
      </Link>
    ))}
  </div>
</div>

      </div>
    </section>
  );
};

export default ProductCard;
