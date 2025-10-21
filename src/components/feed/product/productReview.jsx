import React from "react";

const getInitials = (fullName) => {
  if (!fullName) return "";

  const parts = fullName.split(" ").filter((part) => part.length > 0);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);

  return (firstInitial + lastInitial).toUpperCase();
};

// function to render star icons
const renderStars = (rating) => {
  // Renders up to 5 stars, where filled stars are a bright color and empty are gray
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <img
        key={i}
        src={i <= rating ? "/icons/star2.svg" : "/icons/star.svg"}
        alt="star rating"
        className="w-4 h-4 inline-block"
      />
    );
  }
  return stars;
};

const ProductReview = ({ review }) => {
  // Dynamically calculate initials here
  const initials = getInitials(review.user);

  return (
    <div className="flex flex-col space-y-2 py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-2">
          {/* Avatar/Initials */}
          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          {/* Name */}
          <p className="font-semibold text-sm">{review.user}</p>
        </div>
        {/* Date */}
        <span className="text-xs text-gray-500">{review.date}</span>
      </div>

      {/* Rating Stars and Text */}
      <div className="pl-10 -mt-1 space-y-1">
        <div className="flex items-center space-x-1">
          {renderStars(review.rating)}
        </div>
        <p className="text-sm text-gray-700">{review.text}</p>
      </div>
    </div>
  );
};

export default ProductReview;
