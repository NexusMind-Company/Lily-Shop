import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function WithdrawConfirm() {
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [receivable, setReceivable] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();

  const bankDetails = state || {
    bankName: "Default Bank",
    accountNumber: "0000000000",
    accountName: "John Doe",
  };

  useEffect(() => {
    const calculated = amount ? parseFloat(amount) * 0.95 : 0;
    setReceivable(calculated.toFixed(2));
  }, [amount]);

  const handleConfirm = () => {
    // Add actual withdrawal logic here
    setShowModal(false);
    navigate("/withdrawSuccess");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="relative p-4 border-2 border-gray-300">
        <Link to="/bankAccountDetails">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Withdraw</h1>
      </header>
    <section className="p-4">

      <div className="my-5 ">
        <h2 className=" font-semibold mb-2">Withdraw to:</h2>
        <div>
          <p className="font-medium flex">{bankDetails.accountNumber}<p className="text-gray-500"> . {bankDetails.bankName}</p></p>
          <p className="font-medium">{bankDetails.accountName}</p>
        </div>
      </div>

      <div className="my-5 ">
        <label className="block text-sm font-medium mb-2">Enter Amount to withdraw (₦)</label>
        <input
          type="number"
          className="w-full p-3 border rounded-lg"
          value={amount}
          placeholder="Min withdrawal (₦500)"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div >
        <div className="my-5 ">
          <span className="block text-sm font-medium mb-2">service Fee (5%):</span>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={`₦${(amount * 0.05).toFixed(2)}`}
            readOnly
          />
        </div>
       </div>

       <div>
        <div>
          <span className="block text-sm font-medium mb-2">Amount You&apos;ll Receive:</span>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={`₦${receivable}`}
            readOnly
          />
        </div>
      </div>

      <div className="fixed flex justify-between gap-10 bottom-0 left-0 right-0 bg-white p-4 border-t">
      <div className="w-2/4">
        <p>You&apos;ll recieve</p>
        <p>₦{receivable}</p>
      </div>
        <button
          className="w-full bg-lily text-white py-3 rounded-lg font-medium"
          onClick={() => setShowModal(true)}>
          Proceed
        </button>
      </div>

      {showModal && (
        <div className="fixed bg-black p-4 inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="font-semibold text-lg mb-4">Enter password to confirm withdrawal</h3>
             <label className="block text-sm font-medium mb-2" htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded-lg mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-center w-full">
              <button className="bg-lily px-5 py-2 text-white rounded-[40px] w-full" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      </section>
    </div>
  );
}
