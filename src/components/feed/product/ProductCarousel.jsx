import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
// IMPORT Navigation module
import { Pagination, Navigation } from "swiper/modules";

// Import Swiper CSS for navigation (must be present for arrows to show)
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function MediaCarousel({ media }) {
  if (!media || media.length === 0) {
    return <div className="aspect-square bg-gray-200"></div>;
  }

  // Custom pagination renderer to show "1 / 4"
  const pagination = {
    clickable: true,
    renderBullet: function (index, className) {
      // This is just to satisfy the function signature, i hid the default bullets.
      return '<span class="' + className + '"></span>';
    },
    // i use the 'type' property to create the custom fraction style
    type: "fraction",
  };

  return (
    <div className="relative">
      <Swiper
        // ADD Navigation module here
        modules={[Pagination, Navigation]}
        pagination={pagination}
        // ADD navigation configuration (default classes will be created)
        navigation={true}
        className="aspect-square" // Ensures a 1:1 aspect ratio like the design
      >
        {media.map((item, index) => (
          <SwiperSlide key={index}>
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                playsInline
                loop
                muted
                className="w-full h-full object-cover"
              />
            )}
          </SwiperSlide>
        ))}

        {/* Custom pagination element to match the design (e.g., 1/4) */}
        {/* Swiper's fraction pagination automatically creates this element with the correct classes */}
        <div className="swiper-pagination"></div>
      </Swiper>

      {/* Custom styling for the fraction pagination AND arrows */}
      <style>{`
        /* --- PAGINATION (FRACTION NUMBERS) STYLING --- */
        .swiper-pagination {
          position: absolute;
          bottom: 10px !important;
          left: 50% !important;
          transform: translateX(-50%);
          /* Changing background to green and text color to white */
          background-color: rgba(0, 128, 0, 0.7) !important; /* Green background */
          color: white !important; /* White text for contrast */
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          width: auto !important;
        }

        /* Target the actual pagination numbers/text inside the container */
        .swiper-pagination-fraction {
            color: white !important; /* Ensure the text inside is white */
        }
        
        /* --- ARROWS (NAVIGATION BUTTONS) STYLING --- */
        /* Targets the arrow button containers */
        .swiper-button-next,
        .swiper-button-prev {
            /* Change the color of the arrow icon (the default Swiper uses SVG or a custom character, whose color is controlled by the 'color' CSS property) */
            color: #008000 !important; /* Set arrow color to Green */
            /* Optional: You may want to change the size or add a background */
            font-size: 28px !important; 
            /* Optional: Add a subtle white background for visibility */
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            padding: 2px;
            width: 40px; /* Adjust size */
            height: 40px; /* Adjust size */
        }

        /* Hide the navigation buttons if they are disabled (e.g., at the start/end of the slider) */
        .swiper-button-next.swiper-button-disabled,
        .swiper-button-prev.swiper-button-disabled {
            opacity: 0.3 !important;
            cursor: default;
        }

      `}</style>
    </div>
  );
}
