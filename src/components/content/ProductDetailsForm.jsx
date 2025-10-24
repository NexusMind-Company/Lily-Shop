import PropTypes from "prop-types";
import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

const ProductDetailsForm = ({ formData, setFormData }) => {
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");

  const addColor = () => {
    if (color && !formData.colors.includes(color)) {
      setFormData({ ...formData, colors: [...formData.colors, color] });
      setColor("");
    }
  };

  const removeColor = (c) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((col) => col !== c),
    });
  };

  const addSize = () => {
    if (size && !formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: [...formData.sizes, size] });
      setSize("");
    }
  };

  const removeSize = (s) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((sz) => sz !== s),
    });
  };

  return (
    <div className="bg-white border border-gray-400 rounded-2xl p-5 mt-4 ">
      <h3 className="font-semibold text-lg mb-4 text-center text-gray-900">
        Product Details
      </h3>

      {/* Product Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="e.g. Flowery Patterned Sundress"
          value={formData.productName}
          onChange={(e) =>
            setFormData({ ...formData, productName: e.target.value })
          }
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₦)
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="12500"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock Quantity
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="e.g. 20"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        />
      </div>

      {/* Available Colors */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Colors
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="e.g. Red"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <button
            onClick={addColor}
            type="button"
            className="bg-lily hover:bg-lily text-white px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.colors.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm text-gray-800"
            >
              {c}
              <X
                className="w-4 h-4 cursor-pointer text-gray-600 hover:text-red-500"
                onClick={() => removeColor(c)}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Available Sizes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Sizes
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="e.g. S, M, L"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
          <button
            onClick={addSize}
            type="button"
            className="bg-lily hover:bg-lily text-white px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sizes.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm text-gray-800"
            >
              {s}
              <X
                className="w-4 h-4 cursor-pointer text-gray-600 hover:text-red-500"
                onClick={() => removeSize(s)}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Delivery Fee */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Fee (₦)
        </label>
        <input
          type="number"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="e.g. 1500"
          value={formData.deliveryFee}
          onChange={(e) =>
            setFormData({ ...formData, deliveryFee: e.target.value })
          }
        />
      </div>

      {/* Description */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="Describe your product..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
    </div>
  );
};

ProductDetailsForm.propTypes = {
  formData: PropTypes.shape({
    productName: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    colors: PropTypes.array,
    sizes: PropTypes.array,
    deliveryFee: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ProductDetailsForm;
