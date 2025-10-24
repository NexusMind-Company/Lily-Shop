import PropTypes from "prop-types";
import { Smile, ShoppingBag } from "lucide-react";

const POST_TYPES = [
  { value: "fun", label: "For Fun", icon: <Smile className="w-5 h-5" /> },
  { value: "product", label: "Sell Product", icon: <ShoppingBag className="w-5 h-5" /> },
];

const PostTypeSelector = ({ postType, setPostType }) => {
  return (
    <div className="bg-white border border-gray-500 rounded-2xl p-5 mt-4">
      <h3 className="text-gray-900 font-semibold mb-4 text-center">
        Choose Post Type
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {POST_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setPostType(type.value)}
            className={`flex flex-col items-center justify-center border rounded-xl py-4 transition-all duration-200 ${
              postType === type.value
                ? "bg-lily text-white"
                : "bg-white text-gray-700 border-gray-300 "
            }`}
          >
            {type.icon}
            <span className="mt-2 font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      <p className=" text-gray-500 mt-4 text-center">
        {postType === "product"
          ? "You'll be asked to enter product details next."
          : "Just a fun post for your followers."}
      </p>
    </div>
  );
};

PostTypeSelector.propTypes = {
  postType: PropTypes.string.isRequired,
  setPostType: PropTypes.func.isRequired,
};

export default PostTypeSelector;
