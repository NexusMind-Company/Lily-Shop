import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createShop } from "../../store/createShopSlice";
import { useDispatch } from "react-redux";

const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

const CreateForm = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([
    { name: "", price: "", image: null, preview: null },
  ]);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { name: "", price: "", image: null, preview: null },
    ]);
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );

    // Mark this field as touched
    setTouched((prev) => ({
      ...prev,
      [`product_${field}_${index}`]: true,
    }));

    // Validate the field as it changes
    validateField(`product_${field}_${index}`, value);
  };

  const validateImageType = (file) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (file && !validTypes.includes(file.type)) {
      return false;
    }
    return true;
  };

  // Helper function to validate file type and size
  const validateFile = (file) => {
    if (!file) return false;

    const isValidType = ALLOWED_FILE_TYPES.includes(file.type);
    const isValidSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;

    if (!isValidType) {
      return "Only JPEG and PNG image formats are allowed.";
    }
    if (!isValidSize) {
      return `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null; // No errors
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Mark as touched
    setTouched((prev) => ({
      ...prev,
      shopImage: true,
    }));

    const validationError = validateFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        shopImage: validationError,
      }));
      e.target.value = ""; // Reset the input value
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.shopImage;
      return newErrors;
    });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProductImageChange = (index, file) => {
    // Mark as touched
    setTouched((prev) => ({
      ...prev,
      [`product_image_${index}`]: true,
    }));

    const validationError = validateFile(file);
    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        [`product_image_${index}`]: validationError,
      }));
      return;
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

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validate the field
    let value;
    switch (field) {
      case "name":
        value = name;
        break;
      case "address":
        value = address;
        break;
      case "category":
        value = category;
        break;
      case "description":
        value = description;
        break;
      default:
        value = "";
    }

    validateField(field, value);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    // Basic validation logic
    if (field === "name" && !value.trim()) {
      newErrors.name = "Shop name is required.";
    } else if (field === "name") {
      delete newErrors.name;
    }

    if (field === "address" && !value.trim()) {
      newErrors.address = "Shop address is required.";
    } else if (field === "address") {
      delete newErrors.address;
    }

    if (field === "category" && !value.trim()) {
      newErrors.category = "Shop category is required.";
    } else if (field === "category") {
      delete newErrors.category;
    }

    if (field === "description" && !value.trim()) {
      newErrors.description = "Shop description is required.";
    } else if (field === "description") {
      delete newErrors.description;
    }

    // Product field validation
    if (field.startsWith("product_name_") && !value.trim()) {
      const index = field.split("_")[2];
      newErrors[`product_name_${index}`] = "Product name is required.";
    } else if (field.startsWith("product_name_")) {
      const index = field.split("_")[2];
      delete newErrors[`product_name_${index}`];
    }

    if (field.startsWith("product_price_") && !value.trim()) {
      const index = field.split("_")[2];
      newErrors[`product_price_${index}`] = "Product price is required.";
    } else if (field.startsWith("product_price_")) {
      const index = field.split("_")[2];
      delete newErrors[`product_price_${index}`];
    }

    setErrors(newErrors);
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setCategory("");
    setDescription("");
    setProducts([{ name: "", price: "", image: null, preview: null }]);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = null;
    }
    setErrors({});
    setTouched({});
  };

  const validateForm = () => {
    const newErrors = {};
    // Mark all fields as touched
    const newTouched = {
      name: true,
      address: true,
      category: true,
      description: true,
      shopImage: true,
    };

    if (!name.trim()) newErrors.name = "Shop name is required.";
    if (!address.trim()) newErrors.address = "Shop address is required.";
    if (!category.trim()) newErrors.category = "Shop category is required.";
    if (!description.trim())
      newErrors.description = "Shop description is required.";
    if (!imageInputRef.current?.files[0])
      newErrors.shopImage = "Shop image is required.";

    products.forEach((product, index) => {
      newTouched[`product_name_${index}`] = true;
      newTouched[`product_price_${index}`] = true;
      newTouched[`product_image_${index}`] = true;

      if (!product.name.trim()) {
        newErrors[`product_name_${index}`] = "Product name is required.";
      }
      if (!product.price.trim()) {
        newErrors[`product_price_${index}`] = "Product price is required.";
      }
      if (!product.image) {
        newErrors[`product_image_${index}`] = "Product image is required.";
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing messages
    setSuccessMessage(false);
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("category", category);
    formData.append("description", description);

    const imageFile = imageInputRef.current?.files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const formattedProducts = products.map((product) => ({
      name: product.name,
      price: parseFloat(product.price),
    }));

    formData.append(
      "products_list",
      JSON.stringify({ products: formattedProducts })
    );

    products.forEach((product, index) => {
      if (product.image) {
        formData.append("images", product.image);
      }
    });

    try {
      const result = await dispatch(createShop(formData)).unwrap();
      setSuccessMessage(true);
      resetForm();
      setTimeout(() => {
        setSuccessMessage(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error creating shop:", error);

      if (error?.status === 401 || error?.message?.includes("Unauthorized")) {
        setErrorMessage("Authentication required. Please log in.");
      } else {
        setErrorMessage(
          error?.message || "Failed to create shop. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Shop created successfully! Redirecting to homepage...
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {errorMessage}
        </div>
      )}

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          ⏳ Creating shop, please wait...
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Shop Name */}
        <div className="flex flex-col relative">
          <label htmlFor="title" className="label left-1 md:left-2">
            Name
          </label>
          <input
            id="title"
            className={`input ${
              touched.name && errors.name ? "border-red-500" : ""
            }`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched.name) {
                validateField("name", e.target.value);
              }
            }}
            onBlur={() => handleBlur("name")}
          />
          {touched.name && errors.name && (
            <span className="text-red-500 text-sm">{errors.name}</span>
          )}
        </div>

        {/* Shop Address */}
        <div className="flex flex-col relative">
          <label htmlFor="address" className="label left-1 md:left-2">
            Address
          </label>
          <input
            id="address"
            className={`input ${
              touched.address && errors.address ? "border-red-500" : ""
            }`}
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (touched.address) {
                validateField("address", e.target.value);
              }
            }}
            onBlur={() => handleBlur("address")}
          />
          {touched.address && errors.address && (
            <span className="text-red-500 text-sm">{errors.address}</span>
          )}
        </div>

        {/* Shop Category */}
        <div className="flex flex-col relative">
          <label htmlFor="category" className="label left-1 md:left-2">
            Category
          </label>
          <input
            id="category"
            className={`input ${
              touched.category && errors.category ? "border-red-500" : ""
            }`}
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (touched.category) {
                validateField("category", e.target.value);
              }
            }}
            onBlur={() => handleBlur("category")}
          />
          {touched.category && errors.category && (
            <span className="text-red-500 text-sm">{errors.category}</span>
          )}
        </div>

        {/* Shop Description */}
        <div className="flex flex-col">
          <label className="bLabel">Description</label>
          <textarea
            className={`border ${
              touched.description && errors.description
                ? "border-red-500"
                : "border-black"
            } rounded-lg p-2 h-28`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (touched.description) {
                validateField("description", e.target.value);
              }
            }}
            onBlur={() => handleBlur("description")}
          />
          {touched.description && errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        {/* Shop Image */}
        <div className="flex flex-col relative gap-2">
          <label className="font-medium text-gray-700">Image</label>

          <input
            ref={imageInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/heif"
            type="file"
            id="media-upload"
            onChange={handleImageChange}
          />

          <label
            htmlFor="media-upload"
            className={`w-full h-32 border-2 border-dashed ${
              touched.shopImage && errors.shopImage
                ? "border-red-500"
                : "border-gray-400"
            } rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-100 transition`}
          >
            <span className="border border-gray-300 px-4 py-2 rounded-lg text-gray-500 text-sm">
              Upload Shop Logo/Banner
            </span>
          </label>

          {touched.shopImage && errors.shopImage && (
            <span className="text-red-500 text-sm">{errors.shopImage}</span>
          )}

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 mt-2 rounded-lg object-contain border border-gray-300"
            />
          )}
        </div>

        {/* Products */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Products</h2>
          {products.map((product, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Name</label>
                <input
                  className={`input ${
                    touched[`product_name_${index}`] &&
                    errors[`product_name_${index}`]
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  value={product.name}
                  onChange={(e) => {
                    handleProductChange(index, "name", e.target.value);
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({
                      ...prev,
                      [`product_name_${index}`]: true,
                    }));
                    validateField(`product_name_${index}`, product.name);
                  }}
                />
                {touched[`product_name_${index}`] &&
                  errors[`product_name_${index}`] && (
                    <span className="text-red-500 text-sm">
                      {errors[`product_name_${index}`]}
                    </span>
                  )}
              </div>

              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Price</label>
                <input
                  className={`input ${
                    touched[`product_price_${index}`] &&
                    errors[`product_price_${index}`]
                      ? "border-red-500"
                      : ""
                  }`}
                  type="text"
                  value={product.price}
                  onChange={(e) => {
                    handleProductChange(index, "price", e.target.value);
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({
                      ...prev,
                      [`product_price_${index}`]: true,
                    }));
                    validateField(`product_price_${index}`, product.price);
                  }}
                />
                {touched[`product_price_${index}`] &&
                  errors[`product_price_${index}`] && (
                    <span className="text-red-500 text-sm">
                      {errors[`product_price_${index}`]}
                    </span>
                  )}
              </div>

              {/* Product Image */}
              <div className="flex flex-col relative gap-2">
                <label className="label left-1">Image</label>
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
                    touched[`product_image_${index}`] &&
                    errors[`product_image_${index}`]
                      ? "border-red-500"
                      : "border-gray-400"
                  } rounded-lg cursor-pointer hover:bg-gray-100`}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/heif"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      handleProductImageChange(index, e.target.files[0]);
                    }}
                  />
                  <span className="text-gray-500 text-sm">
                    Upload Product Image
                  </span>
                </div>

                {touched[`product_image_${index}`] &&
                  errors[`product_image_${index}`] && (
                    <span className="text-red-500 text-sm">
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
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="bg-gray-800 my-4 text-white px-4 py-2 rounded-md hover:bg-lily hover:text-white cursor-pointer"
        >
          Add Product
        </button>

        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="/createShop">Discard</Link>
          </button>
          <button
            disabled={loading}
            type="submit"
            className="bg-white text-black py-2 w-[105px] hover:bg-lily hover:text-white cursor-pointer"
          >
            Save & Deploy
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateForm;
