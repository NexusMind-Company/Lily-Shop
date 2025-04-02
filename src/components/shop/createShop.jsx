/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createShop } from "../../redux/createShopSlice";
import { useDispatch } from "react-redux";

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

const CreateShop = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);

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
      e.target.value = "";
      return;
    }

    // Revoke previous preview URL to prevent memory leaks
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.shopImage;
      return newErrors;
    });
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Please enter a shop name";
    }
    if (!address.trim()) {
      newErrors.address = "Please enter a shop address";
    }
    if (!category.trim()) {
      newErrors.category = "Please enter a shop category";
    }
    if (!description.trim()) {
      newErrors.description = "Please enter a shop description";
    }
    if (!imageInputRef.current?.files[0]) {
      newErrors.shopImage = "Please upload a shop image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    if (field === "name" && !value.trim()) {
      newErrors.name = "Please enter a shop name";
    } else if (field === "name") {
      delete newErrors.name;
    }

    if (field === "address" && !value.trim()) {
      newErrors.address = "Please enter a shop address";
    } else if (field === "address") {
      delete newErrors.address;
    }

    if (field === "category" && !value.trim()) {
      newErrors.category = "Please enter a shop category";
    } else if (field === "category") {
      delete newErrors.category;
    }

    if (field === "description" && !value.trim()) {
      newErrors.description = "Please enter a shop description";
    } else if (field === "description") {
      delete newErrors.description;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing messages
    setSuccessMessage(false);
    setErrorMessage(null);

    // Validate the form
    if (!validateForm()) {
      // Mark all fields as touched to display error messages
      setTouched({
        name: true,
        address: true,
        category: true,
        description: true,
        shopImage: true,
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("address", address.trim());
    formData.append("category", category.trim());
    formData.append("description", description.trim());

    const imageFile = imageInputRef.current?.files[0];
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out. Please try again.")),
          30000
        )
      );

      const createShopPromise = dispatch(createShop(formData)).unwrap();
      await Promise.race([createShopPromise, timeoutPromise]);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        navigate("/myShop");
      }, 4000);
    } catch (err) {
      console.error("Failed to create shop:", err);
      let errorMessage = "Failed to create shop. ";
      if (err.message.includes("timeout")) {
        errorMessage += "Request timed out. Please try again.";
      } else if (err.message.includes("network")) {
        errorMessage += "Network error. Please check your connection.";
      } else if (err.status === 401) {
        errorMessage = "Please log in to create a shop.";
      } else if (err.status === 413) {
        errorMessage =
          "The uploaded file is too large. Please upload a smaller file.";
      } else {
        errorMessage += "Please try again later.";
      }
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 mb-44 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Creating shop, please wait...
        </div>
      )}

      {successMessage && (
        <div className="fixed top-5 md:right-5 right-0 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Shop created successfully! Redirecting to your shop...
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {errorMessage}
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
              touched.name && errors.name
                ? "border-[1px] border-solid border-red-500"
                : ""
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
            <span className="text-red-500 text-sm mt-1">{errors.name}</span>
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
              touched.address && errors.address
                ? "border-[1px] border-solid border-red-500"
                : ""
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
            <span className="text-red-500 text-sm mt-1">{errors.address}</span>
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
              touched.category && errors.category
                ? "border-[1px] border-solid border-red-500"
                : ""
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
            <span className="text-red-500 text-sm mt-1">{errors.category}</span>
          )}
        </div>

        {/* Shop Description */}
        <div className="flex flex-col">
          <label className="bLabel">Description</label>
          <textarea
            className={`border-[1px] border-solid ${
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
            <span className="text-red-500 text-sm mt-1">
              {errors.description}
            </span>
          )}
        </div>

        {/* Shop Image */}
        <div className="flex flex-col relative gap-2">
          <label className="font-medium text-gray-700">Image</label>

          <input
            ref={imageInputRef}
            className="hidden"
            accept="image/png, image/jpeg"
            type="file"
            id="media-upload"
            onChange={handleImageChange}
          />

          <label
            htmlFor="media-upload"
            className={`w-full h-32 border-[2px] border-dashed ${
              touched.shopImage && errors.shopImage
                ? "border-red-500"
                : "border-gray-400"
            } rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-100 transition-colors`}
          >
            <span className="border-[1px] border-solid border-gray-300 px-4 py-2 rounded-lg text-gray-500 text-sm">
              {imagePreview ? "Change Image" : "Upload Shop Logo/Banner"}
            </span>
          </label>

          {touched.shopImage && errors.shopImage && (
            <span className="text-red-500 text-sm mt-1">
              {errors.shopImage}
            </span>
          )}

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 mt-2 rounded-lg object-contain border-[1px] border-solid border-gray-300"
            />
          )}
        </div>

        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <Link to="/myShop">Discard</Link>
          </button>
          <button
            disabled={loading}
            type="submit"
            className="z-10 bg-white text-black py-2 w-[105px] hover:bg-lily hover:text-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Saving...
              </span>
            ) : (
              "Save & Deploy"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateShop;
