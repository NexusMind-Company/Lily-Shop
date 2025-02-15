import productData from "../information/productData";

const productCard = () => {
  return (
    <section className="mt-[40px] flex flex-col px-7 gap-7 md:items-center md:justify-center">
      <div className="rounded-2xl border border-black h-[70px] min-w-10/12 max-w-[362px] flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Welcome to <span className="text-[#4EB75E]">Lily Shop</span>
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs/[18px]">
          <span className="border-b-2 border-[#F6AD6D]">For Y</span>ou
          <br />
          <span className="h-2 w-2 bg-red-900"></span>
        </h2>
        <div className="flex items-center justify-start overflow-x-auto whitespace-nowrap gap-5">
          {productData.map((product) => {
            return (
              <div
                key={product.id}
                className="flex flex-col gap-5 flex-shrink-0 h-80 text-wrap"
              >
                <img
                  className="rounded-lg h-[188px] w-[141px]"
                  src={product.image}
                  alt={product.name}
                />
                <ul className="border-l-2 border-[#F6AD6D] pl-1.5 font-inter">
                  <li className="text-[13px]/[19.5px] text-[#4EB75E] font-bold font-poppins uppercase">{product.name}</li>
                  <li className="text-[9px]/[10.89px] font-extralight">
                    {product.shortDescription}
                  </li>
                  <li className="text-[9px]/[10.89px] font-normal">
                    {product.address}
                  </li>
                  <button className=" text-[8px]/[9.68px] underline">View Prices</button>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default productCard;
