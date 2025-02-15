"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreateShop = () => {
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
    <section className="mt-10 flex flex-col gap-7 items-center justify-center">
      <div className="px-7 w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-poppins">
            Create <span className="text-lily">Shop</span>
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-5"
      >
        {/* Title */}
        <div className="flex flex-col relative px-7">
          <input
            className="input"
            type="text"
            {...register("title", { required: true })}
            placeholder=" "
          />
          <label className="label">Title</label>
          {errors.title && (
            <span className="text-red-500 text-sm">Title is required</span>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col relative px-7">
          <input
            className="input"
            type="text"
            {...register("address", { required: true })}
            placeholder=" "
          />
          <label className="label">Address</label>
        </div>

        {/* Phone */}
        <div className="flex flex-col relative px-7">
          <input
            className="input"
            type="number"
            {...register("phone", { required: true })}
            placeholder=" "
          />
          <label className="label">Phone</label>
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
          <label className="label top-12">Display Photo</label>
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
              <input
                className="input"
                type="text"
                {...register(`products[${index}].name`, { required: true })}
              />
              <input
                className="input"
                type="text"
                {...register(`products[${index}].price`, { required: true })}
              />

              {/* Product Photos */}
              <div className="flex flex-col relative gap-1">
                <input
                  className="input hidden"
                  type="file"
                  id={`product-file-${index}`}
                  {...register(`products[${index}].file`, { required: true })}
                />
                <label className="label left-1">Products Photo</label>
                <label
                  htmlFor={`product-file-${index}`}
                  className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
                >
                  <span className="border border-ash p-1.5 rounded-lg w-48 text-center">
                    Upload
                  </span>
                </label>
              </div>

              {/* Product Videos */}
              <div className="flex flex-col relative gap-1">
                <input
                  className="input hidden"
                  type="file"
                  id={`product-file-${index}`}
                  {...register(`products[${index}].file`, { required: true })}
                />
                <label className="label left-1">Products Videos</label>
                <label
                  htmlFor={`product-file-${index}`}
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
        <button
          type="button"
          onClick={handleAddProduct}
          className="bg-gray-800 mx-7 text-white px-4 py-2 rounded-md"
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
          <label className="label">Documents</label>
          <label
            htmlFor="media-upload"
            className="px-4 py-2 h-20 border border-dashed text-ash border-black rounded-md cursor-pointer flex items-center justify-center"
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
            className="border border-black rounded-lg p-2 h-20"
            type="text"
            {...register("inputCategory")}
          />
        </div>

        {/* Discard & Create field */}
        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button type="submit" className="bg-ash text-white py-2 w-[105px]">
            Discard
          </button>
          <button type="submit" className="bg-white text-black py-2 w-[105px]">
            Save & Deploy
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateShop;
