import PropTypes from "prop-types";
import { Smile, ShoppingBag } from "lucide-react";

const POST_TYPES = [
  {
    value: "fun",
    label: "For Fun",
    icon: <Smile className="w-5 h-5" />,
    description: "A regular fun post with media and caption.",
  },
  {
    value: "product",
    label: "Sell Product",
    icon: <ShoppingBag className="w-5 h-5" />,
    description: "Create a product listing with price & availability.",
  },
];

const PostTypeSelector = ({ postType, setPostType }) => {
  return (
    <div className="bg-white border border-gray-500 rounded-2xl p-5 mt-4">
      <h3 className="text-gray-900 font-semibold mb-4 text-center">
        Choose Post Type
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {POST_TYPES.map((type) => {
          const isActive = postType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setPostType(type.value)}
              className={`flex flex-col items-center justify-center border rounded-xl py-4 transition-all duration-200 ${
                isActive
                  ? "bg-lily text-white border-lily"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {type.icon}
              <span className="mt-2 font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-gray-500 mt-4 text-center text-sm">
        {
          POST_TYPES.find((t) => t.value === postType)?.description ||
          "Select a post type."
        }
      </p>
    </div>
  );
};

PostTypeSelector.propTypes = {
  postType: PropTypes.string,
  setPostType: PropTypes.func.isRequired,
};

export default PostTypeSelector;
