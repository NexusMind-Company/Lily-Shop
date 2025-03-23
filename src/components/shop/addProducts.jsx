import { useState } from "react";

const AddProducts = () => {
  const [products, setProducts] = useState([
    { name: "", price: "", image: null, preview: null },
  ]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

    // Mark this field as touched
    setTouched((prev) => ({
      ...prev,
      [`product_${field}_${index}`]: true,
    }));

    // Validate the field as it changes
    validateField(`product_${field}_${index}`, value);
  };

  const handleProductImageChange = (index, file) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (file && !validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`product_image_${index}`]: "Only JPEG and PNG image formats are allowed.",
      }));
      return;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`product_image_${index}`];
      return newErrors;
    });

    setProducts((prev) =>
      prev.map((product, i) =>
        i === index
          ? { ...product, image: file, preview: URL.createObjectURL(file) }
          : product
      )
    );
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    if (field.startsWith("product_name_") && !value.trim()) {
      const index = field.split("_")[2];
      newErrors[`product_name_${index}`] = "Product name is required.";
    } else if (field.startsWith("product_name_")) {
      const index = field.split("_")[2];
      delete newErrors[`product_name_${index}`];
    }

    if (field.startsWith("product_price_") && !value.trim()) {
      const index = field.split("_")[2];
      newErrors[`product_price_${index}`] = "Product price is required.";
    } else if (field.startsWith("product_price_")) {
      const index = field.split("_")[2];
      delete newErrors[`product_price_${index}`];
    }

    setErrors(newErrors);
  };

  const handleSubmit = () => {
    // Validate all products before submission
    const newErrors = {};
    products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_name_${index}`] = "Product name is required.";
      }
      if (!product.price.trim()) {
        newErrors[`product_price_${index}`] = "Product price is required.";
      }
      if (!product.image) {
        newErrors[`product_image_${index}`] = "Product image is required.";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Products submitted:", products);
      // Perform submission logic here (e.g., API call)
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">Products</h2>
      {products.map((product, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex flex-col relative gap-1">
            <label className="label left-1">Name</label>
            <input
              className={`input ${
                touched[`product_name_${index}`] &&
                errors[`product_name_${index}`]
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              value={product.name}
              onChange={(e) => handleProductChange(index, "name", e.target.value)}
            />
            {touched[`product_name_${index}`] &&
              errors[`product_name_${index}`] && (
                <span className="text-red-500 text-sm">
                  {errors[`product_name_${index}`]}
                </span>
              )}
          </div>

          <div className="flex flex-col relative gap-1">
            <label className="label left-1">Price</label>
            <input
              className={`input ${
                touched[`product_price_${index}`] &&
                errors[`product_price_${index}`]
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              value={product.price}
              onChange={(e) => handleProductChange(index, "price", e.target.value)}
            />
            {touched[`product_price_${index}`] &&
              errors[`product_price_${index}`] && (
                <span className="text-red-500 text-sm">
                  {errors[`product_price_${index}`]}
                </span>
              )}
          </div>

          <div className="flex flex-col relative gap-2">
            <label className="label left-1">Image</label>
            <div
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
                touched[`product_image_${index}`] &&
                errors[`product_image_${index}`]
                  ? "border-red-500"
                  : "border-gray-400"
              } rounded-lg cursor-pointer hover:bg-gray-100`}
            >
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => handleProductImageChange(index, e.target.files[0])}
              />
              <span className="text-gray-500 text-sm">Upload Product Image</span>
            </div>
            {touched[`product_image_${index}`] &&
              errors[`product_image_${index}`] && (
                <span className="text-red-500 text-sm">
                  {errors[`product_image_${index}`]}
                </span>
              )}
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
      <button
        type="button"
        onClick={handleAddProduct}
        className="bg-gray-800 my-4 text-white px-4 py-2 rounded-md hover:bg-lily hover:text-white cursor-pointer"
      >
        Add Product
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        className="bg-lily text-white px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white cursor-pointer"
      >
        Submit Products
      </button>
    </div>
  );
};

export default AddProducts;