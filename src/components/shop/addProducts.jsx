/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, resetAddProductState } from "../../redux/addProductSlice";

const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

const validateFile = (file) => {
  if (!file) return "No file selected.";

  // Check file extension
  const fileExtension = "." + file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return "Only JPEG and PNG formats are allowed.";
  }

  // Check MIME type
  if (!file.type || !ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Invalid file type. Only JPEG and PNG formats are allowed.";
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null; // No errors
};

const AddProducts = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, success } = useSelector((state) => state.addProduct);
  const loading = status === "loading";

  const [products, setProducts] = useState([
    { name: "", price: "", image: null, preview: null },
  ]);
  const [errors, setErrors] = useState({});

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      products.forEach((product) => {
        if (product.preview) {
          URL.revokeObjectURL(product.preview);
        }
      });
    };
  }, [products]);

  useEffect(() => {
    if (!shop_id) {
      console.error("Error: Shop ID is missing!");
      return;
    }

    if (success) {
      setProducts([{ name: "", price: "", image: null, preview: null }]);
      setTimeout(() => {
        dispatch(resetAddProductState());
        navigate("/myShop");
      }, 4000);
    }
  }, [shop_id, success, dispatch, navigate]);

  if (!shop_id) {
    return <p className="text-red-500">Error: Shop ID is missing!</p>;
  }

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { name: "", price: "", image: null, preview: null },
    ]);
  };

  const handleDeleteProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    if (field === "price") {
      // Validate price input
      if (value && !/^\d*\.?\d*$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          [`product_price_${index}`]:
            "Please enter a valid price (e.g., 10.99)",
        }));
        return;
      }
      if (parseFloat(value) < 0) {
        setErrors((prev) => ({
          ...prev,
          [`product_price_${index}`]: "Price cannot be negative",
        }));
        return;
      }
      if (parseFloat(value) > 1000000) {
        setErrors((prev) => ({
          ...prev,
          [`product_price_${index}`]: "Price cannot exceed 1,000,000",
        }));
        return;
      }
    }

    // Clear error when user starts typing
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`product_${field}_${index}`];
      return newErrors;
    });

    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  const handleProductImageChange = (index, file) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        [`product_image_${index}`]: validationError,
      }));
      return;
    }

    // Revoke previous preview URL to prevent memory leaks
    if (products[index].preview) {
      URL.revokeObjectURL(products[index].preview);
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`product_image_${index}`];
      return newErrors;
    });

    setProducts((prev) =>
      prev.map((product, i) =>
        i === index
          ? { ...product, image: file, preview: URL.createObjectURL(file) }
          : product
      )
    );
  };

  const handleSubmit = async () => {
    if (!shop_id) {
      setErrors({ submit: "Shop ID is missing. Please try again." });
      return;
    }

    const newErrors = {};
    products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_name_${index}`] = "Please enter a product name";
      }
      if (!product.price.trim()) {
        newErrors[`product_price_${index}`] = "Please enter a price";
      } else if (isNaN(parseFloat(product.price))) {
        newErrors[`product_price_${index}`] = "Please enter a valid price";
      } else if (parseFloat(product.price) <= 0) {
        newErrors[`product_price_${index}`] = "Price must be greater than 0";
      }
      if (!product.image) {
        newErrors[`product_image_${index}`] = "Please upload a product image";
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please fix the errors before submitting",
      }));
      return;
    }

    const formData = new FormData();
    const productsData = products.map((product) => ({
      name: product.name.trim(),
      price: parseFloat(product.price),
    }));
    formData.append("products", JSON.stringify(productsData));

    products.forEach((product) => {
      if (product.image) {
        formData.append("images", product.image);
      }
    });

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out. Please try again.")),
          30000
        )
      );

      const addProductPromise = dispatch(
        addProduct({ shop_id, formData })
      ).unwrap();
      await Promise.race([addProductPromise, timeoutPromise]);
    } catch (err) {
      console.error("Failed to add products:", err);
      let errorMessage = "Failed to add products. ";
      if (err.message.includes("timeout")) {
        errorMessage += "Request timed out. Please try again.";
      } else if (err.message.includes("network")) {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += "Please try again later.";
      }
      setErrors({ submit: errorMessage });
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Add <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Adding products, please wait...
        </div>
      )}

      {success && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Products added successfully! Redirecting to your shop...
        </div>
      )}

      {(error || errors.submit) && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {error || errors.submit}
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-5"
      >
        {products.map((product, index) => (
          <div key={index} className="flex flex-col gap-5 border-b pb-5">
            {/* Product Name */}
            <div className="flex flex-col relative">
              <label className="label left-1 md:left-2">Name</label>
              <input
                className={`input ${
                  errors[`product_name_${index}`] ? "border-red-500" : ""
                }`}
                type="text"
                value={product.name}
                onChange={(e) =>
                  handleProductChange(index, "name", e.target.value)
                }
              />
              {errors[`product_name_${index}`] && (
                <span className="text-red-500 text-sm mt-1">
                  {errors[`product_name_${index}`]}
                </span>
              )}
            </div>

            {/* Product Price */}
            <div className="flex flex-col relative">
              <label className="label left-1 md:left-2">Price</label>
              <div className="relative">
                <input
                  className={`input ${
                    errors[`product_price_${index}`] ? "border-red-500" : ""
                  }`}
                  type="text"
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                />
              </div>
              {errors[`product_price_${index}`] && (
                <span className="text-red-500 text-sm mt-1">
                  {errors[`product_price_${index}`]}
                </span>
              )}
            </div>

            {/* Product Image */}
            <div className="flex flex-col relative gap-2">
              <label className="font-medium text-gray-700">Image</label>
              <div
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
                  errors[`product_image_${index}`]
                    ? "border-red-500"
                    : "border-gray-400"
                } rounded-lg cursor-pointer hover:bg-gray-100 transition-colors`}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    handleProductImageChange(index, e.target.files[0])
                  }
                />
                <span className="text-gray-500 text-sm">
                  {product.preview ? "Change Image" : "Upload Product Image"}
                </span>
              </div>
              {errors[`product_image_${index}`] && (
                <span className="text-red-500 text-sm mt-1">
                  {errors[`product_image_${index}`]}
                </span>
              )}
              {product.preview && (
                <img
                  src={product.preview}
                  alt="Preview"
                  className="w-full h-32 mt-2 rounded-lg object-contain border border-gray-300"
                />
              )}
            </div>

            {/* Delete Product Button */}
            <button
              type="button"
              onClick={() => handleDeleteProduct(index)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer transition-colors"
            >
              Delete Product
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddProduct}
          className="bg-gray-800 my-4 text-white px-4 py-2 rounded-md hover:bg-lily hover:text-white cursor-pointer transition-colors"
        >
          Add Product
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-lily text-white px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </span>
          ) : (
            "Submit Products"
          )}
        </button>
      </form>
    </section>
  );
};

export default AddProducts;
