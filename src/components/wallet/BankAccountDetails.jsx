import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function BankAccountDetails() {
    const banks = [
    {
      bankName: 'Opay',
      accountNumber: '8027894512',
      accountName: 'Adeyemi Isaac'
    }
    // ... other bank entries ...
  ];


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="relative p-4 border-2 border-gray-300">
        <Link to="/withdraw">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Bank Details</h1>
      </header>

      <section className="p-4 space-y-4">
      {banks.map((bank) =>(
      <Link to="/confirmWithdrawal" key={bank.accountNumber}>
        <div className="p-4 border rounded-lg border-gray-300">
          <p className="font-semibold mt-2">
            {bank.accountNumber}
            <span className=" text-gray-500"> . </span>{" "}
            <span className=" text-gray-500"> Default</span>{" "}
          </p>
          <p className="font-medium">{bank.bankName}</p>
          <Link to="/addBankAccount">
            <button className="text-sm text-red-500">+ Add new bank</button>
          </Link>
        </div>
        </Link>
        ))}
        
      </section>
      <section className="p-4 mt-auto">
      <button className="w-full  bg-lily text-white py-3 rounded-lg font-medium">
          Withdraw Now
        </button>
        </section>
    </div>
  );
}
