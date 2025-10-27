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
        modules={[Pagination, Navigation]}
        pagination={pagination}
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
    </div>
  );
}
