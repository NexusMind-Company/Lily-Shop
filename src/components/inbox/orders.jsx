import {Link} from "react-router-dom"
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import BottomNav from "./bottomNav";
const Orders = () => {
  const orders = [
    {
      name: "Flowery patterned sundress",
      orderNo: "#LS-20251008-06741",
      status: "Pending",
      date: "8/10/25",
    },
    {
      name: "Leather biker jacket",
      orderNo: "#LS-20251004-00593",
      status: "Delivered",
      date: "4/10/25",
    },
    {
      name: "Striped cotton t-shirt",
      orderNo: "#LS-20251004-00406",
      status: "Delivered",
      date: "4/10/25",
    },
    {
      name: "Flowery patterned sundress",
      orderNo: "#LS-20250926-00032",
      status: "Refunded",
      date: "26/09/25",
    },
    {
      name: "Silk blend scarf",
      orderNo: "#LS-20250918-34608",
      status: "Canceled",
      date: "18/09/25",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Refunded":
        return "bg-blue-100 text-blue-700";
      case "Canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

    const [activePage, setActivePage] = useState("inbox");

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="relative p-4 ">
      <Link to="/inbox">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-[20px] font-semibold text-center">Inbox</h1>
      </header>

      <section className="p-4">
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-md"></div>
                <div>
                  <h3 className="font-medium text-gray-800">{order.name}</h3>
                  <p className="text-xs text-gray-500">Order no: {order.orderNo}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                        order.status
                      )}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                </div>
              </div>
              {order.status === "Delivered" && (
                <button className="text-pink-600 text-xs font-medium">Rate product</button>
              )}
            </div>
          ))}
        </div>
      </section>
      
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Orders;
