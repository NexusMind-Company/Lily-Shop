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

  const [products, setProducts] = useState([{ name: "", price: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const dispatch = useDispatch();
  const { status, error, success } = useSelector((state) => state.createShop);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.title);
      formData.append("description", data.detailedDescription);
      formData.append("category", data.inputCategory);
      formData.append("address", data.address);

      if (data.media && data.media[0]) {
        formData.append("image", data.media[0]);
      }

      const validProducts = products.filter(
        (product) => product.name.trim() !== ""
      );
      formData.append("products_list", JSON.stringify(validProducts));

      // Append product images
      validProducts.forEach((product, index) => {
        if (product.image) {
          formData.append(`product_image_${index}`, product.image);
        }
      });

      // Debugging: Log form data before sending
      console.log("Form Data Debugging:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Dispatch and log response
      const response = await dispatch(createShop(formData)).unwrap();
      console.log("API Response:", response);

      setShowSuccess(true);
      reset();
      setProducts([{ name: "", price: "", image: null }]);
      setImagePreview(null);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating shop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "" }]);
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductImageChange = (index, file) => {
    if (file) {
      setProducts((prev) =>
        prev.map((product, i) =>
          i === index
            ? { ...product, image: file, preview: URL.createObjectURL(file) }
            : product
        )
      );
    }
  };
  // Reset Redux state on unmount
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
        {/* Form fields */}
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

        <div className="flex flex-col px-7">
          <label className="bLabel">Short Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-20"
            {...register("shortDescription")}
          />
        </div>

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

        <div className="flex flex-col relative gap-2 px-7">
          <label className="font-medium text-gray-700">Image</label>

          <input
            className="hidden"
            accept="image/png, image/jpeg"
            type="file"
            id="media-upload"
            {...register("media")}
            onChange={handleImageChange}
          />

          <label
            htmlFor="media-upload"
            className="w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
          >
            <span className="border border-gray-300 px-4 py-2 rounded-lg text-gray-500 text-sm">
              Upload Shop Logo/Banner
            </span>
          </label>

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 mt-2 rounded-lg object-contain border border-gray-300"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold px-7">Products</h2>
          {products.map((product, index) => (
            <div key={index} className="flex flex-col gap-2 px-7">
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
              <div className="flex flex-col relative gap-2">
                <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleProductImageChange(index, e.target.files[0])
                    }
                  />
                  <span className="text-gray-500 text-sm">Upload Product Image</span>
                </div>

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
          className="bg-gray-800 mx-7 my-4 text-white px-4 py-2 rounded-md"
        >
          Add Product
        </button>

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
