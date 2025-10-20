import PropType from "prop-types"

const POST_TYPES = [
  { value: "fun", label: "Just for Fun / Social Content" },
  { value: "product", label: "Product for Sale" },
];

const PostTypeSelector = ({ postType, setPostType }) => (
  <div className="border rounded p-3 mt-4">
    <h3 className="font-semibold mb-2">Choose Post Type</h3>
    <div className="flex gap-4">
      {POST_TYPES.map((type) => (
        <label key={type.value} className="flex items-center gap-2">
          <input
            type="radio"
            name="postType"
            value={type.value}
            checked={postType === type.value}
            onChange={() => setPostType(type.value)}
          />
          {type.label}
        </label>
      ))}
    </div>
  </div>
);

export default PostTypeSelector;

PostTypeSelector.propTypes = {
  postType: PropType.string.isRequired,
  setPostType: PropType.func.isRequired,
}
