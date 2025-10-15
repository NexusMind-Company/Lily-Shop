import PropTypes from "prop-types";

const ProductDetailsForm = ({ details, setDetails }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDetails({
      ...details,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="border rounded p-3 mt-4">
      <h3 className="font-semibold mb-2">Product Details</h3>
      <div className="mb-2">
        <label>Product Name:</label>
        <input
          type="text"
          name="name"
          className="border rounded px-2 py-1 w-full"
          value={details.name || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Price:</label>
        <input
          type="number"
          name="price"
          className="border rounded px-2 py-1 w-full"
          value={details.price || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Quantity Available:</label>
        <input
          type="number"
          name="quantity"
          className="border rounded px-2 py-1 w-full"
          value={details.quantity || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2 flex items-center gap-2">
        <label>Affiliate Available:</label>
        <input
          type="checkbox"
          name="affiliate"
          checked={details.affiliate || false}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Delivery Info:</label>
        <input
          type="text"
          name="delivery"
          className="border rounded px-2 py-1 w-full"
          value={details.delivery || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Stock Status:</label>
        <select
          name="stock"
          className="border rounded px-2 py-1 w-full"
          value={details.stock || ""}
          onChange={handleChange}>
          <option value="">Select</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      <div className="mb-2">
        <label>Buy Now CTA:</label>
        <input
          type="checkbox"
          name="buyNow"
          checked={details.buyNow || false}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Discount Info:</label>
        <input
          type="text"
          name="discount"
          className="border rounded px-2 py-1 w-full"
          value={details.discount || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Sizes:</label>
        <input
          type="text"
          name="sizes"
          className="border rounded px-2 py-1 w-full"
          value={details.sizes || ""}
          onChange={handleChange}
        />
      </div>
      <div className="mb-2">
        <label>Colors:</label>
        <input
          type="text"
          name="colors"
          className="border rounded px-2 py-1 w-full"
          value={details.colors || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

ProductDetailsForm.propTypes = {
  details: PropTypes.any,
  setDetails: PropTypes.any, // Add this line for setDetails prop validation
};

export default ProductDetailsForm;
