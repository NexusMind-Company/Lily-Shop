import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const ConfirmPhone = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const handleResend = () => {
    setResendMsg("Verification code resent!");
    setTimeout(() => setResendMsg(""), 2000);
  };

  const handleConfirm = () => {
    alert("Code confirmed: " + code);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between w-full">
      <div className="w-full">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ChevronLeft size={30} className="mr-3" />
          </button>
          <h2 className="font-semibold text-lg flex-1 text-center">Confirm Phone Number</h2>
        </div>
        <div className="mt-8 px-4 w-full">
          <p className="mb-4 text-center w-4/5 mx-auto">
            Enter the verification code sent to +2348096735289.
          </p>
          <label htmlFor="code" className="blobk text-sm pb-2">
            Verification code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Verification code"
            className="w-full rounded-3xl bg-gray-200 px-3 py-2 mb-2"
          />
          <button onClick={handleResend} className="text-red-500 flex justify-end w-full">
            Resend code
          </button>
          {resendMsg && <p className="mt-2 text-green-600 text-center">{resendMsg}</p>}
        </div>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={handleConfirm}
          className="bg-lily text-white px-4 py-2 rounded-3xl w-full "
          disabled={!code.trim()}>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmPhone;
