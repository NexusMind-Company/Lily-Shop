/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createShop } from "../../store/createShopSlice";
import { useDispatch } from "react-redux";

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
  const [errors, setErrors] = useState({});

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

  const resetForm = () => {
    setName("");
    setAddress("");
    setCategory("");
    setDescription("");
    setProducts([{ name: "", price: "", image: null, preview: null }]);
    setImagePreview(null);
    imageInputRef.current.value = null;
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Shop name is required.";
    if (!address.trim()) newErrors.address = "Shop address is required.";
    if (!category.trim()) newErrors.category = "Shop category is required.";
    if (!description.trim())
      newErrors.description = "Shop description is required.";

    products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_name_${index}`] = "Product name is required.";
      }
      if (!product.price.trim()) {
        newErrors[`product_price_${index}`] = "Product price is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      await dispatch(createShop(formData));
      setSuccessMessage(true);
      resetForm();
      setTimeout(() => {
        setSuccessMessage(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error creating shop:", error);
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

      {successMessage && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Shop created successfully! Redirecting to homepage...
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
        {/* Shop Name */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="title" className="label">
            Name
          </label>
          <input
            id="title"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name}</span>
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
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && (
            <span className="text-red-500 text-sm">{errors.address}</span>
          )}
        </div>

        {/* Shop Category */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="category" className="label">
            Category
          </label>
          <input
            id="category"
            className="input"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          {errors.category && (
            <span className="text-red-500 text-sm">{errors.category}</span>
          )}
        </div>

        {/* Shop Description */}
        <div className="flex flex-col px-7">
          <label className="bLabel">Description</label>
          <textarea
            className="border border-black rounded-lg p-2 h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        {/* Shop Image */}
        <div className="flex flex-col relative gap-2 px-7">
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

        {/* Products */}
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
                {errors[`product_name_${index}`] && (
                  <span className="text-red-500 text-sm">
                    {errors[`product_name_${index}`]}
                  </span>
                )}
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
                {errors[`product_price_${index}`] && (
                  <span className="text-red-500 text-sm">
                    {errors[`product_price_${index}`]}
                  </span>
                )}
              </div>

              {/* Product Image */}
              <div className="flex flex-col relative gap-2">
                <label className="label left-1">Image</label>
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
          className="bg-gray-800 mx-7 my-4 text-white px-4 py-2 rounded-md hover:bg-lily hover:text-white cursor-pointer"
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
