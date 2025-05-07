/* eslint-disable react/prop-types */
import { useDispatch, useSelector } from "react-redux";
import { deleteShop, resetDeleteShopState } from "../../redux/deleteShopSlice";
import { useEffect, useRef } from "react";
import ErrorDisplay from "../common/ErrorDisplay";

const Delete = ({ delIsOpen, toggleDel, shop_id, entityName = "shop" }) => {
  const dispatch = useDispatch();
  const { deleteStatus: status, error } = useSelector(
    (state) => state.deleteShop
  );

  const cancelBtnRef = useRef();

  const handleDelete = async () => {
    try {
      await dispatch(deleteShop(shop_id)).unwrap();
      toggleDel();
    } catch (err) {
      console.error(`Failed to delete ${entityName}:`, err);
    }
  };

  useEffect(() => {
    if (delIsOpen && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [delIsOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && delIsOpen) {
        if (status !== "loading") {
          toggleDel();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [delIsOpen, toggleDel, status]);

  useEffect(() => {
    if (!delIsOpen) {
      dispatch(resetDeleteShopState());
    }
  }, [delIsOpen, dispatch]);

  if (!delIsOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/[50%] bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== "loading") {
          toggleDel();
        }
      }}
      aria-hidden={!delIsOpen}
    >
      <div
        className="relative flex flex-col gap-5 p-6 rounded-lg w-full max-w-md bg-white shadow-xl transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-inter font-bold text-lg text-gray-800">
          Are you sure you want to delete this {entityName}?
        </h2>
        <p className="font-inter font-normal text-sm text-gray-600">
          This will delete this {entityName} permanently. You cannot undo this
          action.
        </p>

        {status === "failed" && error && (
          <div className="my-2">
            <ErrorDisplay
              message={
                typeof error === "string"
                  ? error
                  : error.message ||
                    `Failed to delete ${entityName}. Please try again.`
              }
            />
          </div>
        )}

        <div className="flex gap-4 font-inter font-normal text-sm mt-2">
          <button
            ref={cancelBtnRef}
            onClick={toggleDel}
            disabled={status === "loading"}
            className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md hover:bg-gray-300 transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={status === "loading"}
            className="flex-1 bg-red-500 text-white py-2.5 px-4 rounded-md hover:bg-red-600 transition-colors duration-150 disabled:opacity-70 flex items-center justify-center"
          >
            {status === "loading" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              `Delete ${
                entityName.charAt(0).toUpperCase() + entityName.slice(1)
              }`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Delete;
