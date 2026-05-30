import React from "react";
import { FaStar } from "react-icons/fa";
const Ratings = ({ shopName }) => {
  const [rating, setRating] = React.useState(null);
  const [hover, setHover] = React.useState(null); // Added hover state
  const stars = Array(5).fill(0); // Defined stars array with 5 elements
  const colors = {
    black: "#000000",
    lily: "#F6AD6D",
  };

  React.useEffect(() => {
    setRating(null); // Ensure the default rating is null
  }, []);

  return (
    <div className="animate-fadeIn">
      <section className="relative flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center shadow-sm">
          {" "}
          <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
            Rate <span className="text-lily">{shopName || "This Shop"}</span>
          </h1>
        </div>

        <div className="w-full flex flex-row mt-5 justify-between items-center">
          <h3 className="font-poppins font-medium text-[15px] md:text-[18px]">
            Share your experience
          </h3>
          <button className="font-poppins font-medium text-[15px] md:text-[18px] text-lily hover:text-opacity-80 transition-colors px-4 py-1 border border-lily rounded-md">
            Post Review
          </button>
        </div>

        <div className="w-full flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm mt-2">
          <div className="flex flex-row gap-3 items-center">
            <div className="w-[36px] h-[36px] rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              U
            </div>
            <div className="flex-1">
              <h3 className="font-poppins text-[14px] font-medium">User</h3>
              <p className="font-inter text-[12px] font-medium text-ash">
                Reviews are public and include your account information
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mt-4 bg-white p-5 rounded-lg shadow-sm">
          <p className="font-medium mb-3 text-center">
            How would you rate this shop?
          </p>
          <div className="flex flex-row justify-center mb-4">
            {stars.map((_, index) => {
              return (
                <FaStar
                  key={index}
                  size={32}
                  style={{ marginRight: 15, cursor: "pointer" }}
                  color={index <= (hover || rating) ? colors.lily : "#e4e5e9"}
                  onClick={() => setRating(index + 1)}
                  onMouseEnter={() => setHover(index + 1)}
                  onMouseLeave={() => setHover(null)}
                />
              );
            })}
          </div>
          <p className="text-sm text-ash mb-4 text-center">
            {rating
              ? `You rated this shop ${rating} out of 5 stars`
              : "Select a rating"}
          </p>

          <div className="rounded-md border-[1px] border-solid border-gray-300 w-full overflow-hidden mt-3 focus-within:border-lily focus-within:ring-1 focus-within:ring-lily transition-all">
            <textarea
              name="reviews"
              id="reviews"
              rows="4"
              placeholder="Describe your experience (optional)"
              className="w-full p-3 placeholder:text-gray-400 font-inter text-[15px] focus:outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ratings;
