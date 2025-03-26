/* eslint-disable react/prop-types */

const ConfirmDeletePopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-[40%] top-[30%] z-50 flex flex-col gap-5 p-5 rounded-[10px] w-[90%] max-w-[400px] bg-white shadow-md transition-all duration-500 ease-in-out">
      <h2 className="font-inter font-black text-sm">
        Are you sure you want to delete this product?
      </h2>
      <p className="font-inter font-normal text-xs">
        This will delete this product permanently. You cannot undo this action.
      </p>
      <div className="flex gap-4 font-inter font-normal text-xs">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 py-2 rounded-md cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-500 text-white py-2 rounded-md cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;
