import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "../../redux/addProductSlice";

const Products = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const { products, status, error } = useSelector((state) => state.addProduct);

  useEffect(() => {
    if (shop_id) {
      dispatch(fetchProducts(shop_id));
    }
  }, [dispatch, shop_id]);

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl font-inter mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            My <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {/* Add New Products */}
      <div className="flex items-start justify-start text-left">
        <Link
          to={`/shop/${shop_id}/add-products`}
          className="font-inter font-semibold text-xs text-black md:text-sm flex items-center gap-2"
        >
          <p>Add Products</p>
          <img src="/addition.svg" alt="addition-icon" className="w-4 md:w-5" />
        </Link>
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-5 pt-10">
        <div className="flex items-start justify-start">
          <h2 className="font-poppins font-semibold text-xs text-black md:text-sm uppercase border-b-2 border-sun text-left">
            My Products
          </h2>
        </div>

        {/* Loading & Error States */}
        {status === "loading" ? (
          <div className="flex items-center justify-center">
            <p className="text-sm">Loading products...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : products.length > 0 ? (
          // Render Products List
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-2 md:gap-3 w-full hover:shadow-lg hover:rounded-2xl transition-shadow duration-200"
              >
                <div className="w-full h-40 md:h-48">
                  <img
                    className="rounded-lg h-full w-full object-cover"
                    src={product.image_url || "/placeholder.png"}
                    alt={product.name}
                  />
                </div>
                <ul className="border-l-2 border-sun pl-2 font-inter">
                  <li className="text-xs text-black font-semibold font-inter truncate">
                    {product.name}
                  </li>
                  <li className="text-xs line-clamp-2">
                    ₦<span className="text-lily">{product.price}</span>
                  </li>
                </ul>
                <div className="flex justify-between gap-3">
                  <Link
                    to={`/shop/${product.id}/edit-products`}
                    className="bg-sun p-1 flex-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white transition-colors duration-200"
                  >
                    Edit
                  </Link>
                  <button className="bg-ash text-white p-1 flex-1 text-xs font-bold text-center hover:bg-red-600 active:bg-red-600 transition-colors duration-200">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // No Products Found Message
          <div className="flex items-center justify-center">
            <p className="text-sm">
              No items found. Click <span className="font-bold">Add New</span>{" "}
              to add your first products.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
