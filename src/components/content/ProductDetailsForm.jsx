import PropTypes from "prop-types";

const ProductDetailsForm = ({ formData, setFormData }) => {
  const updateField = (patch) =>
    setFormData({
      ...formData,
      ...patch,
    });

  return (
    <div className="bg-white border border-gray-400 rounded-2xl p-5 mt-4">
      <h3 className="font-semibold text-lg mb-4 text-center text-gray-900">
        Product Details
      </h3>

      {/* ✅ Product Name (max 50 chars required by backend) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="e.g. Flowery Patterned Sundress"
          value={formData.productName}
          onChange={(e) => updateField({ productName: e.target.value })}
        />
        <p className="text-xs text-gray-400 mt-1">Max 50 characters</p>
      </div>

      {/* ✅ Price */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₦)
        </label>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="12500"
          value={formData.price}
          onChange={(e) => updateField({ price: e.target.value })}
        />
      </div>

      {/* ✅ In Stock (boolean) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          In Stock
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="inStock"
              checked={formData.inStock === true}
              onChange={() => updateField({ inStock: true })}
              className="mr-2 accent-lime-500"
            />
            Yes
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="inStock"
              checked={formData.inStock === false}
              onChange={() => updateField({ inStock: false })}
              className="mr-2 accent-lime-500"
            />
            No
          </label>
        </div>
      </div>

      {/* ✅ Quantity Available */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Available
        </label>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="0"
          value={formData.quantity_available}
          onChange={(e) =>
            updateField({ quantity_available: e.target.value })
          }
        />
      </div>

      {/* ✅ Delivery Info */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Info
        </label>
        <textarea
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="Delivery to Lagos at ₦5000"
          value={formData.delivery_info}
          onChange={(e) => updateField({ delivery_info: e.target.value })}
        />
      </div>

      {/* ✅ Promotable (boolean) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Promotable
        </label>

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="promotable"
              checked={formData.promotable === true}
              onChange={() => updateField({ promotable: true })}
              className="mr-2 accent-lime-500"
            />
            Yes
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="promotable"
              checked={formData.promotable === false}
              onChange={() => updateField({ promotable: false })}
              className="mr-2 accent-lime-500"
            />
            No
          </label>
        </div>
      </div>
    </div>
  );
};

ProductDetailsForm.propTypes = {
  formData: PropTypes.shape({
    productName: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inStock: PropTypes.bool,
    quantity_available: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    delivery_info: PropTypes.string,
    promotable: PropTypes.bool,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ProductDetailsForm;
