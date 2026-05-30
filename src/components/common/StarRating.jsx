import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({ rating, setRating, size = 24, interactive = true }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setRating && setRating(star)}
          onMouseEnter={() => interactive && setHover && setHover(star)}
          onMouseLeave={() => interactive && setHover && setHover(null)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;