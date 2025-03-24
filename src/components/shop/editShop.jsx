/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateShop } from "../../redux/deleteShopSlice";

const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

const EditShop = () => {
  const { shop_id } = useParams();
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
    return null;
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
      e.target.value = "";
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.shopImage;
      return newErrors;
    });
    setImagePreview(URL.createObjectURL(file));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Clear any existing messages
  setSuccessMessage(false);
  setErrorMessage(null);

  setLoading(true);

  const formData = new FormData();

  // Append fields only if they are not empty
  if (name.trim()) {
    formData.append("name", name);
  }
  if (address.trim()) {
    formData.append("address", address);
  }
  if (category.trim()) {
    formData.append("category", category);
  }
  if (description.trim()) {
    formData.append("description", description);
  }

  const imageFile = imageInputRef.current?.files[0];
  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    // Dispatch the updateShop action with the shop ID and form data
    const result = await dispatch(
      updateShop({ id: shop_id, updatedData: formData })
    ).unwrap();
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      navigate("/myShop");
    }, 2000);
  } catch (error) {
    console.error("Error updating shop:", error);
    setErrorMessage("An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Edit <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Shop updated successfully! Redirecting to homepage...
        </div>
      )}

      {errorMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {errorMessage}
        </div>
      )}

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          ⏳ Updating shop, please wait...
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
            onChange={(e) => setName(e.target.value)}
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
            onChange={(e) => setAddress(e.target.value)}
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
            onChange={(e) => setCategory(e.target.value)}
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
            onChange={(e) => setDescription(e.target.value)}
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
            accept="image/png, image/jpeg"
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

        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="/myShop">Discard</Link>
          </button>
          <button
            disabled={loading}
            type="submit"
            className="bg-white text-black py-2 w-[105px] hover:bg-lily hover:text-white cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditShop;
