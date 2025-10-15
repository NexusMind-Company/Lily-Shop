import { ChevronLeft, Plus, Landmark, ShoppingCart, Undo2, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function TransactHistory() {
  const transactions = [
    {
      icon: Plus,
      title: "Deposit from Adeyemi Isaac",
      amount: "+₦30,000",
      date: "7th Oct, 2025",
      status: "successful",
    },
    {
      icon: Landmark,
      title: "Withdrawal to 802789*** Opay",
      amount: "-₦10,000",
      date: "2nd Oct, 2025",
      status: "pending",
    },
    {
      icon: ShoppingCart,
      title: "Order Payment #LS-4573473837",
      amount: "-₦10,000",
      date: "27th Sep, 2025",
      status: "successful",
    },
    {
      icon: Undo2,
      title: "Refund for order #LS-4573473837",
      amount: "+₦10,000",
      date: "29th Sep, 2025",
      status: "successful",
    },
    {
      icon: Link2,
      title: "Affiliate earnings from GadgetCity",
      amount: "+₦100",
      date: "29th Sep, 2025",
      status: "successful",
    },
    {
      icon: ShoppingCart,
      title: "Order Payment #LS-4573473837",
      amount: "-₦10,000",
      date: "27th Sep, 2025",
      status: "successful",
    },
    {
      icon: Plus,
      title: "Deposit from Adeyemi Isaac",
      amount: "+₦30,000",
      date: "7th Oct, 2025",
      status: "successful",
    },
    {
      icon: Landmark,
      title: "Withdrawal to 802789*** Opay",
      amount: "-₦10,000",
      date: "2nd Oct, 2025",
      status: "pending",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="relative p-4 border-2 border-gray-300">
        <Link to="/wallet">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-lg font-semibold text-center">Transaction History</h1>
      </header>

      <section className="flex-1 p-4">
        <ul className="space-y-3">
          {transactions.map((tx, index) => (
            <li key={index} className="flex justify-between bg-white p-3 w-full">
              <div className="flex gap-2 items-center w-3/4">
                <tx.icon className="w-7 h-7" />
                <div className="flex flex-col items-start">
                  <p className="font-medium">{`${tx.title.slice(0, 23)}...`}</p>
                  <p className="text-xs text-gray-600">{tx.date}</p>
                </div>
              </div>
              <div className="flex flex-col w-1/4 items-end">
                <span className={`font-semibold ${
                  tx.status === 'successful' ? 'text-green-500' : 
                  tx.status === 'pending' ? 'text-red-500' :  'text-gray-800'
                }`}>
                  {tx.amount}
                </span>
                <p className="text-xs capitalize">{tx.status}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}