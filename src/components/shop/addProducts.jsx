import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, resetAddProductState } from "../../redux/addProductSlice";
import {
  FiPlus,
  FiTrash2,
  FiImage,
  FiX,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import MentionText from "../common/MentionText";
import MentionSuggestions from "../common/MentionSuggestions";

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const AddProducts = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    status,
    error: apiError,
    success,
  } = useSelector((state) => state.addProduct);

  const isLoading = status === "loading";

  const [products, setProducts] = useState([
    {
      id: Date.now(),
      name: "",
      price: "",
      caption: "",
      image: null,
      preview: null,
      errors: {},
    },
  ]);

  const [mentionConfig, setMentionConfig] = useState({
    show: false,
    productId: null,
    cursorPos: 0,
  });

  const productsRef = useRef(products);
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      productsRef.current.forEach((product) => {
        if (product.preview) {
          URL.revokeObjectURL(product.preview);
        }
      });
    };
  }, []);

  // Handle success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(resetAddProductState());
        navigate(`/shop/${shop_id}/products`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, shop_id, navigate, dispatch]);

  const validateProduct = (product) => {
    const errors = {};

    if (!product.name.trim()) {
      errors.name = "Product name is required";
    } else if (product.name.length < 3) {
      errors.name = "Name must be at least 3 characters";
    } else if (product.name.length > 50) {
      errors.name = "Name must not exceed 50 characters";
    }

    if (!product.price) {
      errors.price = "Price is required";
    } else {
      const priceNum = parseFloat(product.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.price = "Price must be greater than 0";
      } else if (priceNum > 10000000) {
        errors.price = "Price too large";
      }
    }

    if (!product.image) {
      errors.image = "Product image is required";
    } else if (!ALLOWED_TYPES.includes(product.image.type)) {
      errors.image = "Only JPEG and PNG images allowed";
    } else if (product.image.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.image = `Image must not exceed ${MAX_FILE_SIZE_MB}MB`;
    }

    return errors;
  };

  const updateProductField = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        const updated = { ...p, [field]: value };

        // Clear error for this field
        if (updated.errors[field]) {
          const newErrors = { ...updated.errors };
          delete newErrors[field];
          updated.errors = newErrors;
        }

        return updated;
      }),
    );
  };

  const handleCaptionChange = (productId, e) => {
    const text = e.target.value;
    const pos = e.target.selectionStart;

    updateProductField(productId, "caption", text);

    // Check for @ mention trigger
    const textBeforeCursor = text.substring(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionConfig({
          show: true,
          productId,
          cursorPos: pos,
        });
      } else {
        setMentionConfig((prev) => ({ ...prev, show: false }));
      }
    } else {
      setMentionConfig((prev) => ({ ...prev, show: false }));
    }
  };

  const handleSelectMention = (username) => {
    const { productId, cursorPos } = mentionConfig;
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const textBeforeCursor = product.caption.substring(0, cursorPos);
    const textAfterCursor = product.caption.substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const newText =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${username} ` +
      textAfterCursor;

    updateProductField(productId, "caption", newText);
    setMentionConfig((prev) => ({ ...prev, show: false }));
  };

  const handleImageChange = (productId, file) => {
    if (!file) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;

        // Cleanup old preview
        if (p.preview) URL.revokeObjectURL(p.preview);

        const errors = { ...p.errors };

        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.image = "Only JPEG and PNG images allowed";
          return { ...p, errors };
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          errors.image = `Image must not exceed ${MAX_FILE_SIZE_MB}MB`;
          return { ...p, errors };
        }

        delete errors.image;

        return {
          ...p,
          image: file,
          preview: URL.createObjectURL(file),
          errors,
        };
      }),
    );
  };

  const clearImage = (productId) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (p.preview) URL.revokeObjectURL(p.preview);
        return { ...p, image: null, preview: null };
      }),
    );
  };

  const addProductRow = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        price: "",
        caption: "",
        image: null,
        preview: null,
        errors: {},
      },
    ]);
  };

  const removeProduct = (productId) => {
    setProducts((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (product?.preview) {
        URL.revokeObjectURL(product.preview);
      }
      return prev.filter((p) => p.id !== productId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all products
    const validatedProducts = products.map((product) => ({
      ...product,
      errors: validateProduct(product),
    }));

    setProducts(validatedProducts);

    const hasErrors = validatedProducts.some(
      (p) => Object.keys(p.errors).length > 0,
    );

    if (hasErrors) {
      return;
    }

    const formData = new FormData();

    const productsData = products.map((p) => ({
      name: p.name.trim(),
      price: parseFloat(p.price),
      caption: p.caption?.trim() || "",
    }));

    formData.append("products", JSON.stringify(productsData));

    products.forEach((p) => {
      if (p.image) {
        formData.append("images", p.image);
      }
    });

    await dispatch(addProduct({ shop_id, formData }));
  };

  if (!shop_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <FiAlertCircle size={48} className="mx-auto mb-4" />
          <p>Error: Shop ID is missing!</p>
          <Link to="/myShop" className="text-lily underline mt-2 block">
            Go back to My Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-28 mb-24 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto">
      {/* Header */}
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Add <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="w-full p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md animate-fade-in">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={20} />
            <div>
              <p className="font-medium">Products added successfully!</p>
              <p className="text-sm">Redirecting to products page...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {apiError && !success && (
        <div className="w-full p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-600" size={20} />
            <div>
              <p className="font-medium">Failed to add products</p>
              <p className="text-sm">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="p-5 border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">
                Product {index + 1}
              </h3>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  disabled={isLoading}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                >
                  <FiTrash2 size={20} />
                </button>
              )}
            </div>

            {/* Product Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) =>
                  updateProductField(product.id, "name", e.target.value)
                }
                disabled={isLoading}
                className={`input h-12 w-full rounded-lg px-4 ${
                  product.errors.name
                    ? "border-red-400"
                    : "border-gray-300 focus:border-lily"
                }`}
                placeholder="Enter product name"
              />
              {product.errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {product.errors.name}
                </p>
              )}
            </div>

            {/* Product Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={product.price}
                onChange={(e) =>
                  updateProductField(product.id, "price", e.target.value)
                }
                disabled={isLoading}
                className={`input h-12 w-full rounded-lg px-4 ${
                  product.errors.price
                    ? "border-red-400"
                    : "border-gray-300 focus:border-lily"
                }`}
                placeholder="0.00"
              />
              {product.errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {product.errors.price}
                </p>
              )}
            </div>

            {/* Product Caption */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (Supports @mentions)
              </label>
              <MentionSuggestions
                isOpen={
                  mentionConfig.show && mentionConfig.productId === product.id
                }
                onClose={() =>
                  setMentionConfig((prev) => ({ ...prev, show: false }))
                }
                inputValue={product.caption}
                cursorPosition={mentionConfig.cursorPos}
                onSelect={handleSelectMention}
              />
              <textarea
                value={product.caption}
                onChange={(e) => handleCaptionChange(product.id, e)}
                disabled={isLoading}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-lily focus:ring-1 focus:ring-lily outline-none transition-all"
                placeholder="Describe your product... use @username to mention"
                rows="3"
              />
              {product.caption && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-xs text-gray-500 mb-1">Mention Preview:</p>
                  <MentionText text={product.caption} className="text-sm" />
                </div>
              )}
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image *
              </label>

              {!product.preview ? (
                <div
                  className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                    product.errors.image
                      ? "border-red-400"
                      : "border-gray-300 hover:border-lily"
                  }`}
                  onClick={() =>
                    document.getElementById(`file-${product.id}`)?.click()
                  }
                >
                  <div className="text-center">
                    <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg border-2 border-gray-300 overflow-hidden">
                  <img
                    src={product.preview}
                    alt={`Product ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => clearImage(product.id)}
                    disabled={isLoading}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <FiX size={16} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs truncate">
                    {product.image?.name}
                  </div>
                </div>
              )}

              <input
                id={`file-${product.id}`}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={(e) =>
                  handleImageChange(product.id, e.target.files[0])
                }
                disabled={isLoading}
                className="hidden"
              />

              {product.errors.image && (
                <p className="text-red-500 text-xs mt-1">
                  {product.errors.image}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Add Another Product Button */}
        <button
          type="button"
          onClick={addProductRow}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-lily hover:text-lily transition-colors"
        >
          <FiPlus size={20} />
          <span>Add Another Product</span>
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`h-12 rounded-full font-bold text-white transition-all ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily hover:shadow-lg transform hover:scale-[1.02]"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding Products...
            </span>
          ) : (
            `Add ${products.length} Product${products.length > 1 ? "s" : ""}`
          )}
        </button>

        {/* Back Link */}
        <Link
          to={`/shop/${shop_id}/products`}
          className="text-center text-sm text-gray-600 hover:text-lily transition-colors"
        >
          ← Back to Products
        </Link>
      </form>
    </section>
  );
};

export default AddProducts;
