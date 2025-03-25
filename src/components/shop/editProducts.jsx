/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProduct,
  resetAddProductState,
} from "../../redux/addProductSlice";

const EditProducts = () => {
  const { product_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, success } = useSelector((state) => state.addProduct);
  const loading = status === "loading";

  const [product, setProduct] = useState({
    name: "",
    price: "",
    image: null,
    preview: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!product_id) {
      console.error("Error: Product ID is missing!");
      return;
    }

    if (success) {
      setProduct({ name: "", price: "", image: null, preview: null });
      setTimeout(() => {
        dispatch(resetAddProductState());
        navigate("/myShop");
      }, 2000);
    }
  }, [product_id, success, dispatch, navigate]);

  if (!product_id) {
    return <p className="text-red-500">Error: Product ID is missing!</p>;
  }

  const handleProductChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductImageChange = (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        product_image: "Only JPEG and PNG formats are allowed.",
      }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.product_image;
      return newErrors;
    });

    setProduct((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async () => {
    if (!product_id) {
      console.error("Product ID is missing!");
      return;
    }

    const newErrors = {};
    if (!product.name.trim()) newErrors.product_name = "Required";
    if (!product.price.trim()) newErrors.product_price = "Required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", parseFloat(product.price));
    if (product.image) {
      formData.append("image", product.image);
    }

    try {
      await dispatch(updateProduct({ id: product_id, formData })).unwrap();
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Edit <span className="text-lily">Product</span>
          </h1>
        </div>
      </div>

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          ⏳ Updating product, please wait...
        </div>
      )}

      {success && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Product updated successfully! Redirecting to homepage
        </div>
      )}

      {error && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {error}
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-5"
      >
        {/* Product Name */}
        <div className="flex flex-col relative">
          <label className="label left-1 md:left-2">Name</label>
          <input
            className={`input ${errors.product_name ? "border-red-500" : ""}`}
            type="text"
            value={product.name}
            onChange={(e) => handleProductChange("name", e.target.value)}
          />
          {errors.product_name && (
            <span className="text-red-500 text-sm">{errors.product_name}</span>
          )}
        </div>

        {/* Product Price */}
        <div className="flex flex-col relative">
          <label className="label left-1 md:left-2">Price</label>
          <input
            className={`input ${errors.product_price ? "border-red-500" : ""}`}
            type="text"
            value={product.price}
            onChange={(e) => handleProductChange("price", e.target.value)}
          />
          {errors.product_price && (
            <span className="text-red-500 text-sm">{errors.product_price}</span>
          )}
        </div>

        {/* Product Image */}
        <div className="flex flex-col relative gap-2">
          <label className="font-medium text-gray-700">Image</label>
          <div
            className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
              errors.product_image ? "border-red-500" : "border-gray-400"
            } rounded-lg cursor-pointer hover:bg-gray-100`}
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleProductImageChange(e.target.files[0])}
            />
            <span className="text-gray-500 text-sm">Upload Product Image</span>
          </div>
          {errors.product_image && (
            <span className="text-red-500 text-sm">{errors.product_image}</span>
          )}
          {product.preview && (
            <img
              src={product.preview}
              alt="Preview"
              className="w-full h-32 mt-2 rounded-lg object-contain border border-gray-300"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-lily text-white px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white cursor-pointer"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Product"}
        </button>
      </form>
    </section>
  );
};

export default EditProducts;
