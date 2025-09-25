import { Link, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchProducts,
  deleteProduct,
  resetDeleteProductStatus,
} from "../../redux/addProductSlice";
import ConfirmDeletePopup from "./confirmDeletePopUp";
import ProductSkeleton from "../loaders/productSkeleton";
import ErrorDisplay from "../common/ErrorDisplay";

const Products = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const {
    products,
    status: fetchStatus,
    error: fetchError,
    deleteSuccess,
  } = useSelector((state) => state.addProduct);
  const navigate = useNavigate();

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [deleteProductError, setDeleteProductError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (shop_id) {
      dispatch(fetchProducts(shop_id));
    }
  }, [dispatch, shop_id]);

  useEffect(() => {
    if (deleteSuccess) {
      setSuccessMessage("Product deleted successfully!");
      setIsPopupOpen(false);
      setSelectedProductId(null);
      dispatch(resetDeleteProductStatus());

      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, dispatch]);

  const handleDeleteClick = (productId) => {
    setSelectedProductId(productId);
    setDeleteProductError(null);
    setIsDeletingProduct(false);
    setSuccessMessage("");
    setIsPopupOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedProductId) {
      setIsDeletingProduct(true);
      setDeleteProductError(null);
      setSuccessMessage("");
      try {
        await dispatch(deleteProduct(selectedProductId)).unwrap();
      } catch (err) {
        setDeleteProductError(
          (err && typeof err === "object" && err.message) ||
            "Failed to delete product. Please try again."
        );
      } finally {
        setIsDeletingProduct(false);
      }
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedProductId(null);
    setIsDeletingProduct(false);
    setDeleteProductError(null);
  };

  const handleEditProductClick = (product) => {
    if (product && product.id) {
      navigate(`/shop/${product.id}/edit-products`, {
        state: { productToEdit: product },
      });
    } else {
      console.error(
        "Cannot edit product: Product data or ID is missing.",
        product
      );
    }
  };

  return (
    <section className="mt-28 mb-20 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl font-inter mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black  h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            My <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="w-full my-3 p-3 text-green-700 bg-green-100 rounded-md border border-green-300 text-center">
          {successMessage}
        </div>
      )}

      <div className="flex items-start justify-start text-left">
        <Link
          to={`/shop/${shop_id}/add-products`}
          className="font-inter font-semibold text-xs text-black md:text-sm flex items-center gap-2"
        >
          <p>Add Products</p>
          <img src="/addition.svg" alt="addition-icon" className="w-4 md:w-5" />
        </Link>
      </div>

      <div className="flex flex-col gap-5 pt-10">
        <div className="flex items-start justify-start">
          <h2 className="font-poppins font-semibold text-xs text-black md:text-sm uppercase border-b-2 border-sun text-left">
            My Products
          </h2>
        </div>

        {fetchStatus === "loading" ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 w-full">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : fetchError ? (
          <ErrorDisplay message={fetchError} center={true} />
        ) : products.length > 0 ? (
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
                  <button
                    onClick={() => handleEditProductClick(product)}
                    className="bg-sun p-1 flex-1 text-xs font-bold text-center hover:bg-lily hover:text-white active:bg-lily active:text-white transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product.id)}
                    className="bg-ash text-white p-1 flex-1 text-xs font-bold text-center hover:bg-red-600 active:bg-red-600 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-10">
            <p className="text-ash">You haven&apos;t added any products yet.</p>
            <Link
              to={`/shop/${shop_id}/add-products`}
              className="text-lily hover:underline mt-2 inline-block"
            >
              Add your first product!
            </Link>
          </div>
        )}
      </div>

      <ConfirmDeletePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingProduct}
        error={deleteProductError}
        entityName="product"
      />
    </section>
  );
};

export default Products;
