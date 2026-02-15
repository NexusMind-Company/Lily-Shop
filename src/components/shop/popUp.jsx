/* eslint-disable react/prop-types */
const PopUp = ({ copyPopUp, handlePopUp }) => {
  return (
    <section className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`flex flex-col gap-5 p-5 rounded-[10px] w-[90%] max-w-[400px] bg-white shadow-md transition-all duration-500 ease-in-out ${
          copyPopUp ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h1 className="font-inter font-black text-sm">
          Shop link copied to clipboard!
        </h1>

        <div className="flex gap-4 font-inter font-normal text-xs">
          <button
            onClick={handlePopUp}
            className="text-black border py-1 px-5 rounded hover:bg-gray-100"
          >
            Okay
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopUp;
