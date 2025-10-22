import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Receipt() {
const navigate = useNavigate

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 ">
        <Link onClick={() => {navigate(-1)}}>
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Transaction Details</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
        <p>No transaction details available.</p>
      </div>
    </div>
  );
}
