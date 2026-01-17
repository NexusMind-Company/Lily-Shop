const IdleTimeoutPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/[50%] bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 text-center font-poppins">
          Session Expired
        </h2>
        <p className="text-gray-600 mb-6 text-center font-inter">
          You have been automatically logged out due to inactivity.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-lily hover:bg-lily-dark text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-lily-light transition duration-150 ease-in-out font-poppins"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default IdleTimeoutPopup;
