import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createAd } from "../../store/adsSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateAdsForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      shop: "", // This should be the shop ID
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      is_active: true,
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("shop", parseInt(data.shop, 10)); // Ensure shop is an integer
      formData.append("start_date", data.start_date.toISOString());
      formData.append("end_date", data.end_date.toISOString());
      formData.append("is_active", data.is_active);

      console.log("FormData being sent:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      // Dispatch the creation action to Redux
      await dispatch(createAd(formData)).unwrap();

      // Show success message
      setShowSuccess(true);
      reset(); // Clear form

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/"); // Redirect to homepage
      }, 3000);
    } catch (error) {
      console.error("Error creating ad:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden">
      <div className="px-7 w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">
            Create <span className="text-lily">Advertisement</span>
          </h1>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Advertisement created successfully! Redirecting...
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full flex flex-col gap-5"
      >
        {/* Shop ID */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="shop" className="label">
            Shop ID
          </label>
          <input
            id="shop"
            className="input"
            type="number" // Ensure the input is numeric
            {...register("shop", { required: "Shop ID is required" })}
          />
          {errors.shop && (
            <span className="text-red-500 text-sm">{errors.shop.message}</span>
          )}
        </div>

        {/* Start Date */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="start_date" className="label">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setValue("start_date", date)}
            className="border border-black rounded-lg pt-4 px-3 h-14 w-full"
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
          />
          {errors.start_date && (
            <span className="text-red-500 text-sm">Start date is required</span>
          )}
        </div>

        {/* End Date */}
        <div className="flex flex-col relative px-7">
          <label htmlFor="end_date" className="label">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setValue("end_date", date)}
            className="border border-black rounded-lg pt-4 px-3 h-14 w-full"
            dateFormat="yyyy-MM-dd"
            minDate={startDate}
          />
          {errors.end_date && (
            <span className="text-red-500 text-sm">End date is required</span>
          )}
        </div>

        {/* Active Advertisement */}
        <div className="flex flex-col px-7">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="w-4 h-4"
            />
            <span className="bLabel pt-2">Active Advertisement</span>
          </label>
        </div>

        <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px]">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="/">Discard</Link>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-black py-2 w-[105px] hover:bg-lily hover:text-white cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Create Ad"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateAdsForm;
