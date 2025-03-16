/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";

const CreateForm = () => {
  const [products, setProducts] = useState([
    { name: "", price: "", image: null },
  ]);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAddProduct = () => {
    setProducts([...products, { name: "", price: "", image: null }]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    // Form submission logic can be added here
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
      <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg hidden">
        ✅ Shop created successfully!
      </div>

      {/* Loading and Error States */}
      <p className="hidden">Loading...</p>
      <p className="text-red-500 hidden">Error message</p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Form fields */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="title" className="label">
            Name
          </label>
          <input id="title" className="input" type="text" />
          <span className="text-red-500 text-sm hidden">Name is required</span>
        </div>

        <div className="flex flex-col relative px-7">
          <label htmlFor="address" className="label">
            Address
          </label>
          <input id="address" className="input" type="text" />
          <span className="text-red-500 text-sm hidden">
            Address is required
          </span>
        </div>

        <div className="flex flex-col relative px-7">
          <label htmlFor="category" className="label">
            Category
          </label>
          <input id="category" className="input" type="text" />
          <span className="text-red-500 text-sm hidden">
            Category is required
          </span>
        </div>

        <div className="flex flex-col px-7">
          <label className="bLabel">Description</label>
          <textarea className="border border-black rounded-lg p-2 h-28" />
          <span className="text-red-500 text-sm hidden">
            Description is required
          </span>
        </div>

        <div className="flex flex-col relative gap-2 px-7">
          <label className="font-medium text-gray-700">Image</label>

          <input
            className="hidden"
            accept="image/png, image/jpeg"
            type="file"
            id="media-upload"
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
                  <span className="text-gray-500 text-sm">
                    Upload Product Image
                  </span>
                </div>

                {product.image && product.image.preview && (
                  <img
                    src={product.image.preview}
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
