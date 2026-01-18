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
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2070&auto=format&fit=crop"
            alt="Celebration Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lily/30 to-lily/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <h1 className="font-bold text-4xl uppercase tracking-wider">Lily Shops</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins leading-tight">
            Celebrate <br /> You
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Let us know when to celebrate you! We love birthdays at Lily Shops.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Title + subtitle */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                When's Your Birthday?
              </h2>
              <p className="font-poppins text-ash text-sm">
                Your birthday won't be displayed publicly
              </p>
            </div>

            {/* Optional Label */}
            <p className="font-poppins font-medium text-start text-ash text-xs mb-2">
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
              className={`w-full py-4 mt-8 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${isLoading
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                }`}
            >
              {isLoading ? "SAVING..." : "NEXT"}
            </button>

            <div className="mt-8 flex justify-center lg:justify-start">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors text-black font-medium"
              >
                <img src="./arrowleft.png" alt="arrow" className="size-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-poppins text-sm group-hover:text-lily transition-colors">
                  Back to Log in
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayPicker;
