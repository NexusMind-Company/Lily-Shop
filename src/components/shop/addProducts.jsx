/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, resetAddProductState } from "../../redux/addProductSlice";
import ErrorDisplay from "../common/ErrorDisplay";

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
  const {
    status,
    error: reduxError,
    success,
  } = useSelector((state) => state.addProduct);
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
    <section className="mt-28 mb-24 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Add <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {/* Global Notifications */}
      {loading && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Adding products, please wait...</span>
        </div>
      )}
      {success && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl">
          ✅ Products added successfully! Redirecting...
        </div>
      )}
      {/* Use ErrorDisplay for submission/redux errors, styled as a toast */}
      {(reduxError || errors.submit) && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-auto max-w-md">
          <ErrorDisplay message={reduxError || errors.submit} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full flex flex-col gap-5 mt-5"
      >
        {products.map((product, index) => {
          return (
            <div
              key={index}
              className="flex flex-col gap-4 p-4 border rounded-lg shadow-sm"
            >
              {/* Product Name */}
              <div className="flex flex-col">
                <label
                  htmlFor={`product_name_${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name
                </label>
                <input
                  id={`product_name_${index}`}
                  className={`input h-[46px] w-full ${
                    errors[`product_name_${index}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(index, "name", e.target.value)
                  }
                />
                {errors[`product_name_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`product_name_${index}`]}
                  </p>
                )}
              </div>

              {/* Product Price */}
              <div className="flex flex-col">
                <label
                  htmlFor={`product_price_${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (₦)
                </label>
                <input
                  id={`product_price_${index}`}
                  className={`input h-[46px] w-full ${
                    errors[`product_price_${index}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  type="text"
                  value={product.price}
                  placeholder="e.g., 1500.50"
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                />
                {errors[`product_price_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`product_price_${index}`]}
                  </p>
                )}
              </div>

              {/* Product Image - ENHANCED UI */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image {products.length > 1 ? `(${index + 1})` : ""}
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                    errors[`product_image_${index}`]
                      ? "border-red-400"
                      : "border-gray-300"
                  } border-dashed rounded-md cursor-pointer hover:border-lily transition-colors`}
                  onClick={() =>
                    document
                      .getElementById(`product_image_input_${index}`)
                      ?.click()
                  } // Trigger click on hidden input
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProductImageChange(index, e.dataTransfer.files[0]);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <div className="space-y-1 text-center">
                    {product.preview ? (
                      <img
                        src={product.preview}
                        alt={`Preview ${index}`}
                        className="mx-auto h-20 w-20 object-cover rounded-md"
                      />
                    ) : (
                      <svg
                        /* ... (SVG icon as in CreateShop) ... */ className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <div className="flex text-sm text-gray-600">
                      <span className="relative rounded-md font-medium text-lily hover:text-lily-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-lily-dark">
                        <span>
                          {product.image ? "Change file" : "Upload a file"}
                        </span>
                        <input
                          type="file"
                          id={`product_image_input_${index}`} // Unique ID for each input
                          accept={ALLOWED_EXTENSIONS.join(",")}
                          onChange={(e) =>
                            handleProductImageChange(index, e.target.files[0])
                          }
                          className="sr-only"
                        />
                      </span>
                      {!product.image && (
                        <p className="pl-1">or drag and drop</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>

                {product.image && !errors[`product_image_${index}`] && (
                  <div className="mt-2 text-sm text-gray-700 flex items-center justify-between">
                    <span className="truncate max-w-[calc(100%-4rem)]">
                      {product.image.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        // Clear file for this specific product index
                        if (product.preview)
                          URL.revokeObjectURL(product.preview);
                        setProducts((prev) =>
                          prev.map((p, i) =>
                            i === index
                              ? { ...p, image: null, preview: null }
                              : p
                          )
                        );
                        setErrors((prev) => {
                          const newErrs = { ...prev };
                          delete newErrs[`product_image_${index}`];
                          return newErrs;
                        });
                        // Manually clear the specific file input if possible (difficult without individual refs)
                        const fileInput = document.getElementById(
                          `product_image_input_${index}`
                        );
                        if (fileInput) fileInput.value = "";
                      }}
                      className="ml-2 text-xs text-red-600 hover:text-red-800 font-medium flex-shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {errors[`product_image_${index}`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`product_image_${index}`]}
                  </p>
                )}
              </div>

              {/* Delete Product Button */}
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(index)}
                  className="mt-2 self-end bg-red-500 text-white px-3 py-1.5 rounded-md text-xs hover:bg-red-700 transition-colors"
                >
                  Remove Product
                </button>
              )}
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="button"
            onClick={handleAddProduct}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Add Another Product
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-lily text-white px-4 py-2.5 rounded-md hover:bg-lily-dark transition-colors font-medium disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : (
              "Submit All Products"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddProducts;
