"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CreateShop = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [products, setProducts] = useState([{ name: "", price: "" }]);

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "" }]);
  };

  return (
    <section className="mt-10 flex flex-col px-7 gap-7 md:items-center md:justify-center">
      <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
        <h1 className="text-xl font-poppins">Create <span className="text-[#4EB75E]">Shop</span></h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col relative">
          <input className="input" type="text" {...register("title", { required: true })} placeholder=" " />
          <label className="label">Title</label>
          {errors.title && <span className="text-red-500 text-sm">Title is required</span>}
        </div>

        {/* Address */}
        <div className="flex flex-col relative">
          <input className="input" type="text" {...register("address", { required: true })} placeholder=" " />
          <label className="label">Address</label>
        </div>

        {/* Phone */}
        <div className="flex flex-col relative">
          <input className="input" type="number" {...register("phone", { required: true })} placeholder=" " />
          <label className="label">Phone</label>
        </div>

        {/* Short Description */}
        <div className="flex flex-col">
          <label>Short Description</label>
          <textarea className="border border-black rounded-lg p-2 h-20" {...register("shortDescription")} />
        </div>

        {/* Detailed Description */}
        <div className="flex flex-col">
          <label>Detailed Description</label>
          <textarea className="border border-black rounded-lg p-2 h-28" {...register("detailedDescription")} />
        </div>

        {/* Media Upload */}
        <div className="flex flex-col relative gap-2">
          <label>Media</label>
          <input className="input h-28" type="file" {...register("media")} />
        </div>

        {/* Dynamic Product Fields */}
        <h2 className="text-lg font-semibold">Products</h2>
        {products.map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <input className="input" type="text" {...register(`products[${index}].name`, { required: true })} placeholder="Product Name" />
            <input className="input" type="text" {...register(`products[${index}].price`, { required: true })} placeholder="Price" />
          </div>
        ))}
        <button type="button" onClick={handleAddProduct} className="bg-gray-800 text-white px-4 py-2 rounded-md">Add Product</button>

        <button type="submit" className="bg-[#4EB75E] text-white px-4 py-2 rounded-md">Create Shop</button>
      </form>
    </section>
  );
};

export default CreateShop;
