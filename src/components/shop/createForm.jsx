import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

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

      const response = await fetch(
        "https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/shops/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create shop");
      }

      // Success actions
      setShowSuccess(true);
      reset(); // Clear the form
      setProducts([{ name: "", price: "" }]);
      setImagePreview(null);

      setTimeout(() => setShowSuccess(false), 3000); // Hide popup after 3s
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-5"
      >
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
