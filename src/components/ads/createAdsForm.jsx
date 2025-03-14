import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createAd } from "../../store/adsSlice";

const CreateAdsForm = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const adStatus = useSelector((state) => state.ads.status);
  const error = useSelector((state) => state.ads.error);

  const [formData, setFormData] = useState({
    shop: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!token) {
      alert("You need to be logged in.");
      return;
    }

    dispatch(createAd({ formData, token }));
  };

  return (
    <div>
      <h2>Create Ad</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Shop ID:
          <input
            type="number"
            name="shop"
            value={formData.shop}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Start Date:
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Date:
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Is Active:
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={adStatus === "loading"}>
          {adStatus === "loading" ? "Submitting..." : "Create Ad"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
};

export default CreateAdsForm;
