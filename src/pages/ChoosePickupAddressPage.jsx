import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ChoosePickupAddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/api/addresses/pickup/");

        const fetchedAddresses = response.data.results || response.data;

        setAddresses(fetchedAddresses);

        if (fetchedAddresses && fetchedAddresses.length > 0) {
          setSelectedId(fetchedAddresses[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch pickup addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="flex items-center px-4 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          aria-label="Go back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-medium pr-8 text-black">
          Choose pickup address
        </h1>
      </div>

      <div className="flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No pickup addresses found.
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              onClick={() => handleSelect(addr.id)}
              className="flex items-start p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="mr-4 mt-0.5 shrink-0">
                {selectedId === addr.id ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" fill="#48C774" />
                    <path
                      d="M8 12.5L11 15.5L16 9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#374151"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium text-black mb-1">
                  {addr.type || "Pickup"}
                </span>
                <span className="text-sm text-gray-800 leading-snug pr-4">
                  {addr.address}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChoosePickupAddressPage;
