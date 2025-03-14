/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createShop, resetCreateShopState } from "../../store/createShopSlice";

const CreateForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // State for products, including name, price, and image
  const [products, setProducts] = useState([{ name: "", price: "", image: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const dispatch = useDispatch();
  const { status, error, success } = useSelector((state) => state.createShop);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.title);
      formData.append("description", data.detailedDescription);
      formData.append("category", data.inputCategory);
      formData.append("address", data.address);

      // Append shop image if available
      if (data.media && data.media[0]) {
        formData.append("image", data.media[0]);
      }

      // Filter out empty products and append to FormData
      const validProducts = products.filter(
        (product) => product.name.trim() !== ""
      );

      validProducts.forEach((product, index) => {
        formData.append(`products[${index}][name]`, product.name);
        formData.append(`products[${index}][price]`, product.price);
        if (product.image) {
          formData.append(`products[${index}][image]`, product.image);
        }
      });

      // Dispatch the Redux action
      await dispatch(createShop(formData)).unwrap();

      // Success actions
      setShowSuccess(true);
      reset(); // Clear the form
      setProducts([{ name: "", price: "", image: null }]); // Reset products
      setImagePreview(null); // Clear image preview

      setTimeout(() => setShowSuccess(false), 3000); // Hide success popup after 3s
    } catch (error) {
      console.error("Error creating shop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new product field
  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "", image: null }]);
  };

  // Handle changes in product fields (name, price)
  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  // Handle image upload for the shop
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle image upload for a specific product
  const handleProductImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setProducts((prev) =>
        prev.map((product, i) =>
          i === index ? { ...product, image: file } : product
        )
      );
    }
  };

  // Reset Redux state when the component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCreateShopState());
    };
  }, [dispatch]);

  return (
    <section className="mt-10 flex flex-col gap-7 md:px-7 min-h-screen max-w-3xl mx-auto">
      <div className="px-7 w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Shop created successfully!
        </div>
      )}

      {/* Loading and Error States */}
      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p className="text-red-500">{error}</p>}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-5"
      >
        {/* Shop Name */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="title" className="label">
            Name
          </label>
          <input
            id="title"
            className="input"
            type="text"
            {...register("title", { required: true, maxLength: 50 })}
          />
          {errors.title && (
            <span className="text-red-500 text-sm">Name is required</span>
          )}
        </div>

        {/* Shop Address */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="address" className="label">
            Address
          </label>
          <input
            id="address"
            className="input"
            type="text"
            {...register("address", { required: true, maxLength: 100 })}
          />
          {errors.address && (
            <span className="text-red-500 text-sm">Address is required</span>
          )}
        </div>

        {/* Shop Phone */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="phone" className="label">
            Phone
          </label>
          <input
            id="phone"
            className="input"
            type="text"
            {...register("phone")}
          />
        </div>

        {/* Shop Short Description */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Short Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-20"
            {...register("shortDescription")}
          />
        </div>

        {/* Shop Detailed Description */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-28"
            {...register("detailedDescription", { required: true })}
          />
          {errors.detailedDescription && (
            <span className="text-red-500 text-sm">
              Description is required
            </span>
          )}
        </div>

        {/* Shop Image Upload */}
        <div className="flex flex-col relative gap-1 px-7">
          <label className="bLabel">Image</label>
          <input
            className="hidden"
            type="file"
            id="media-upload"
            {...register("media")}
            onChange={handleImageChange}
          />
          <label
            htmlFor="media-upload"
            className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
          >
            <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
              Upload
            </span>
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 mt-2" />
          )}
        </div>

        {/* Product List */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold px-7">Products</h2>
          {products.map((product, index) => (
            <div key={index} className="flex flex-col gap-2 px-7">
              {/* Product Name */}
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Name</label>
                <input
                  className="input"
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    handleProductChange(index, "name", e.target.value)
                  }
                />
              </div>

              {/* Product Price */}
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Price</label>
                <input
                  className="input"
                  type="text"
                  value={product.price}
                  onChange={(e) =>
                    handleProductChange(index, "price", e.target.value)
                  }
                />
              </div>

              {/* Product Image Upload */}
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Image</label>
                <input
                  className="hidden"
                  type="file"
                  id={`product-image-${index}`}
                  onChange={(e) => handleProductImageChange(index, e)}
                />
                <label
                  htmlFor={`product-image-${index}`}
                  className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
                >
                  <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
                    Upload Image
                  </span>
                </label>
                {product.image && (
                  <img
                    src={URL.createObjectURL(product.image)}
                    alt="Product Preview"
                    className="w-20 h-20 mt-2"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <button
          type="button"
          onClick={handleAddProduct}
          className="bg-gray-800 mx-7 my-4 text-white px-4 py-2 rounded-md"
        >
          Add Product
        </button>

        {/* Shop Category */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Category</label>
          <input
            className="border border-black rounded-lg px-2 h-14"
            type="text"
            {...register("inputCategory", { required: true })}
          />
          {errors.inputCategory && (
            <span className="text-red-500 text-sm">Category is required</span>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="/createShop">Discard</Link>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-black py-2 w-[105px] cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save & Deploy"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateForm;