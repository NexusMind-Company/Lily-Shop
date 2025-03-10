"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

const CreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [products, setProducts] = useState([{ name: "", price: "" }]);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "" }]);
  };

  return (
    <section className="mt-10 flex flex-col gap-7 md:px-7 min-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="px-7 w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-5"
      >
        {/* Title */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            className="input"
            type="text"
            {...register("title", { required: true, maxLength: 50 })}
          />
          {errors.title && (
            <span className="text-red-500 text-sm">Title is required</span>
          )}
        </div>

        {/* Address */}
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
        </div>

        {/* Phone */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="phone" className="label">
            Phone
          </label>
          <input
            id="phone"
            className="input"
            type="tel"
            {...register("phone", { required: true })}
          />
        </div>

        {/* Short Description */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Short Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-20"
            {...register("shortDescription")}
          />
        </div>

        {/* Detailed Description */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Detailed Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-28"
            {...register("detailedDescription")}
          />
        </div>

        {/* Media Upload */}
        <div className="flex flex-col relative gap-1 px-7">
          <label className="bLabel">Media</label>
          <input
            className="input hidden"
            type="file"
            id="media-upload"
            {...register("media")}
          />
          <label
            htmlFor="media-upload"
            className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
          >
            <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
              Upload
            </span>
          </label>
        </div>

        {/* Dynamic Product Fields */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold px-7">Products</h2>
          {products.map((_, index) => (
            <div key={index} className="flex flex-col gap-2 px-7">
              {/* Product Name */}
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Name</label>
                <input
                  className="input"
                  type="text"
                  {...register(`products[${index}].name`, { required: true })}
                />
              </div>

              {/* Product Price */}
              <div className="flex flex-col relative gap-1">
                <label className="label left-1">Price</label>
                <input
                  className="input"
                  type="text"
                  {...register(`products[${index}].price`, { required: true })}
                />
              </div>

              {/* Product Photo */}
              <div className="flex flex-col relative gap-1">
                <input
                  className="input hidden"
                  type="file"
                  id={`product-photo-${index}`}
                  {...register(`products[${index}].photo`, { required: true })}
                />
                <label className="label left-1">Photo</label>
                <label
                  htmlFor={`product-photo-${index}`}
                  className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
                >
                  <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
                    Upload
                  </span>
                </label>
              </div>

              {/* Product Video */}
              <div className="flex flex-col relative gap-1">
                <input
                  className="input hidden"
                  type="file"
                  id={`product-video-${index}`}
                  {...register(`products[${index}].video`, { required: true })}
                />
                <label className="label left-1">Video</label>
                <label
                  htmlFor={`product-video-${index}`}
                  className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
                >
                  <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
                    Upload
                  </span>
                </label>
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

        {/* Upload Documents */}
        <div className="flex flex-col relative gap-1 px-7">
          <input
            className="input hidden"
            type="file"
            id="document-upload"
            {...register("document")}
          />
          <label className="label pb-2">Documents</label>
          <label
            htmlFor="media-upload"
            className="px-4 py-2 h-24 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
          >
            <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
              Upload
            </span>
          </label>
        </div>

        {/* Input Category */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Category</label>
          <input
            className="border border-black rounded-lg px-2 h-14"
            type="text"
            {...register("inputCategory")}
          />
        </div>

        {/* Discard & Create Buttons */}
        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="/createShop">Discard</Link>
          </button>
          <button
            type="submit"
            className="bg-white text-black py-2 w-[105px] cursor-pointer"
          >
            Save & Deploy
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateForm;
