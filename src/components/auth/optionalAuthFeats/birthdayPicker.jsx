import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BirthdayPicker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="input flex items-center text-ash font-medium text-sm rounded-[7px] h-[46px] w-full pr-10 mt-3"
    >
      {value ? (
        <>
          <img src="./calendar-icon.svg" alt="" className="mr-2" /> {value}
        </>
      ) : (
        <>
          {/* SVG Icon */}
          <img src="./calendar-icon.svg" alt="" className="mr-2" />

          <span>13th October 2002</span>
        </>
      )}
    </button>
  ));

  // Function to send date to backend
  const sendDateToBackend = async (date) => {
    try {
      setIsLoading(true);

      // Format date for backend
      const isoDate = date.toISOString().split("T")[0]; // YYYY-MM-DD format
      const displayDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const response = await fetch("/api/user/birthday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthday: isoDate,
          formatted_birthday: displayDate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Birthday saved successfully:", result);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error saving birthday:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleNext = () => {
    if (selectedDate) {
      sendDateToBackend(selectedDate);
    } else {
      navigate("/create-username");
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 items-center max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      <div className="max-w-md w-full">
        {/* Title + subtitle */}
        <div className="grid place-items-center gap-3 mb-3">
          <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
            When's Your Birthday?
          </h2>
          <p className="font-poppins font-medium text-center text-ash text-xs">
            Your birthday won't be displayed publicly
          </p>
        </div>

        {/* Optional Label */}
        <p className="font-poppins font-medium text-start text-ash text-xs mt-5">
          Optional
        </p>

        <div className="">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd MMMM yyyy"
            customInput={<CustomInput />}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            maxDate={new Date()}
            calendarClassName="border border-gray-200 rounded-lg shadow-lg"
            dayClassName={() => "hover:bg-green-50 hover:text-green-800"}
            wrapperClassName="w-full"
          />
        </div>

        <button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full pt-0 h-[46px] my-7 bg-lily border-none rounded-full font-inter font-bold text-[15px]/[18.51px] text-white cursor-pointer hover:bg-darklily disabled:opacity-50"
        >
          {isLoading ? "SAVING..." : "NEXT"}
        </button>

        <button
          onClick={handleBackToLogin}
          className="inline-flex items-center text-black font-medium"
        >
          <img src="./arrowleft.png" alt="" className="size-4" />
          <span className="ml-2 mb-1">Back to Log in</span>
        </button>
      </div>
    </section>
  );
};

export default BirthdayPicker;
