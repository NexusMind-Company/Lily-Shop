import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function AddBankAccount() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const dropdownRef = useRef(null);

  // Nigerian banks list
  const banks = [
    // Commercial Banks
    "Access Bank",
    "Zenith Bank",
    "First Bank of Nigeria",
    "United Bank for Africa (UBA)",
    "Guaranty Trust Bank (GTBank)",
    "Union Bank of Nigeria",
    "Fidelity Bank",
    "Stanbic IBTC Bank",
    "First City Monument Bank (FCMB)",
    "Keystone Bank",
    "Ecobank Nigeria",
    "Heritage Bank",
    "LAPO Microfinance Bank",
    "AB Microfinance Bank",
    "Sparkle Microfinance Bank",
    "Addosser Microfinance Bank",
    "Advans La Fayette Microfinance Bank",
    "Baobab Microfinance Bank",
    "CEMCS Microfinance Bank",
    "Credit Afrique Microfinance Bank",
    "FFS Microfinance Bank",
    "Mutual Benefits Microfinance Bank",
    "Rephidim Microfinance Bank",
    "Renmoney Microfinance Bank",
    "VFD Microfinance Bank",
    "Yes Microfinance Bank",
  ];

  const filteredBanks = banks.filter((bank) =>
    bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <header className="relative p-4 ">
        <Link onClick={() => {navigate(-1)}}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Add Bank Account</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Account Number</label>
          <input
            type="number"
            className="w-full p-3 border rounded-lg "
            placeholder="Enter account number"
            required
            minLength={9}
          />
        </div>

        <div className="space-y-2" ref={dropdownRef}>
          <label className="block text-sm font-medium">Bank Name</label>
          <div className="relative">
            <div
              className="w-full p-3 border rounded-lg bg-white cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}>
              {selectedBank || "Select Bank"}
            </div>

            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                <input
                  type="text"
                  placeholder="Search banks..."
                  className="w-full p-2 border-b"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredBanks.map((bank, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedBank(bank);
                        setIsOpen(false);
                      }}>
                      {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Account Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder="Enter account name"
            required
            minLength={3}
          />
        </div>
      </div>

      <div className="p-4 mt-auto">
        <button className="w-full bg-lily text-white py-3 rounded-lg font-medium">
          Save Account
        </button>
      </div>
    </div>
  );
}
