/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, resetAddProductState } from "../../redux/addProductSlice";

const AddProducts = () => {
  const { shop_id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, success } = useSelector((state) => state.addProduct);
  const loading = status === "loading";

  const [products, setProducts] = useState([
    { name: "", price: "", image: null, preview: null },
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!shop_id) {
      console.error("Error: Shop ID is missing!");
      return;
    }

    if (success) {
      setProducts([{ name: "", price: "", image: null, preview: null }]);
      setTimeout(() => {
        dispatch(resetAddProductState());
        navigate("/myShop");
      }, 2000);
    }
  }, [shop_id, success, dispatch, navigate]);

  if (!shop_id) {
    return <p className="text-red-500">Error: Shop ID is missing!</p>;
  }

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { name: "", price: "", image: null, preview: null },
    ]);
  };

  const handleDeleteProduct = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  const handleProductImageChange = (index, file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`product_image_${index}`]: "Only JPEG and PNG formats are allowed.",
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

  const handleSubmit = async () => {
    if (!shop_id) {
      console.error("Shop ID is missing!");
      return;
    }

    const newErrors = {};
    products.forEach((product, index) => {
      if (!product.name.trim()) newErrors[`product_name_${index}`] = "Required";
      if (!product.price.trim())
        newErrors[`product_price_${index}`] = "Required";
      if (!product.image) newErrors[`product_image_${index}`] = "Required";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = new FormData();

    // Add products as a JSON string
    const productsData = products.map((product) => ({
      name: product.name,
      price: parseFloat(product.price),
    }));
    formData.append("products", JSON.stringify(productsData));

    products.forEach((product) => {
      if (product.image) {
        formData.append("images", product.image);
      }
    });

    try {
      await dispatch(addProduct({ shop_id, formData })).unwrap();
      console.log("All products added successfully!");
    } catch (err) {
      console.error("Failed to add products:", err);
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Add <span className="text-lily">Products</span>
          </h1>
        </div>
      </div>

      {loading && (
        <div className="fixed top-5 right-5 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          ⏳ Adding products, please wait...
        </div>
      )}

      {success && (
        <div className="fixed top-5 right-5 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Products added successfully! Redirecting to homepage...
        </div>
      )}

      {error && (
        <div className="fixed top-5 right-5 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          ❌ {error}
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-5"
      >
        {products.map((product, index) => (
          <div key={index} className="flex flex-col gap-5 border-b pb-5">
            {/* Product Name */}
            <div className="flex flex-col relative">
              <label className="label left-1 md:left-2">Name</label>
              <input
                className={`input ${
                  errors[`product_name_${index}`] ? "border-red-500" : ""
                }`}
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

            {/* Product Price */}
            <div className="flex flex-col relative">
              <label className="label left-1 md:left-2">Price</label>
              <input
                className={`input ${
                  errors[`product_price_${index}`] ? "border-red-500" : ""
                }`}
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
              <label className="font-medium text-gray-700">Image</label>
              <div
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${
                  errors[`product_image_${index}`]
                    ? "border-red-500"
                    : "border-gray-400"
                } rounded-lg cursor-pointer hover:bg-gray-100`}
              >
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
              {errors[`product_image_${index}`] && (
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

            {/* Delete Product Button */}
            <button
              type="button"
              onClick={() => handleDeleteProduct(index)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
            >
              Delete Product
            </button>
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
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Products"}
        </button>
      </form>
    </section>
  );
};

export default AddProducts;