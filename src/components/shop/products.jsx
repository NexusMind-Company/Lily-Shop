import { Link, useParams } from "react-router-dom";

const Products = () => {
  const { shop_id } = useParams();

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl font-inter mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            My <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {/*Add New Products */}
      <div className="flex items-start justify-start text-left">
        <Link
          to={`/shop/${shop_id}/add-products`}
          className="font-inter font-semibold text-xs text-black md:text-sm flex items-center gap-2"
        >
          <p>Add Products</p>
          <img src="/addition.svg" alt="addition-icon" className="w-4 md:w-5" />
        </Link>
      </div>

      {/*Edit Products */}
      <div className="flex flex-col gap-10 pt-10">
        <div className="flex items-start justify-start">
          <h2 className="font-poppins font-semibold text-xs text-black md:text-sm uppercase border-b-2 border-sun text-left">
            My Products
          </h2>
        </div>

        <div className="flex items-center justify-center">
          <p className="text-sm">
            No items found. Click <span className="font-bold">Add New</span> to
            add your first products
          </p>
        </div>
      </div>
    </section>
  );
};

export default Products;
