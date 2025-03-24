/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { deleteShop, resetDeleteShopState } from "../../redux/deleteShopSlice";
import { useEffect } from "react";

const Delete = ({ delIsOpen, toggleDel, shop_id, entityName = "shop" }) => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.deleteShop);

  const handleDelete = async () => {
    try {
      await dispatch(deleteShop(shop_id)).unwrap();
      console.log(`${entityName} deleted successfully!`);
      console.log("Deleting shop with ID:", shop_id);
      toggleDel(); // Close the delete modal
      dispatch(resetDeleteShopState()); // Reset the delete state
    } catch (err) {
      console.error(`Failed to delete ${entityName}:`, err);
    }
  };

  // Reset error state when the modal is closed
  useEffect(() => {
    if (!delIsOpen) {
      dispatch(resetDeleteShopState());
    }
  }, [delIsOpen, dispatch]);

  if (!delIsOpen) return null;

  return (
    <section
      aria-hidden={!delIsOpen}
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        className={`flex flex-col gap-5 p-5 rounded-[10px] w-[90%] max-w-[400px] bg-white shadow-md transition-all duration-500 ease-in-out ${
          delIsOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h1 className="font-inter font-black text-sm">
          Are you sure you want to delete this {entityName}?
        </h1>

        <p className="font-inter font-normal text-xs">
          This will delete this {entityName} permanently. You cannot undo this
          action.
        </p>

        {status === "loading" && <p className="text-blue-500">Deleting...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex gap-4 font-inter font-normal text-xs">
          <button
            onClick={toggleDel}
            className="text-black border py-1 px-5 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={status === "loading"}
            className="text-white py-1 px-5 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </section>
  );
};

export default Delete;