import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../redux/orderSlice";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import BottomNav from "./bottomNav";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  const [activePage, setActivePage] = useState("inbox");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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

  const getOrderImage = (order) => {
    return (
      order.image ||
      order.product?.image ||
      order.product_image ||
      order.product?.thumbnail ||
      null
    );
  };

  return (
    <div className="bg-white min-h-screen relative w-full h-screen overflow-hidden md:w-4xl md:mx-auto">
      {/* Header */}
      <header className="relative p-4">
        <Link to="/inbox">
          <ChevronLeft className="absolute w-8 h-8" />
        </Link>
        <h1 className="text-[20px] font-semibold text-center">Orders</h1>
      </header>

      <section className="p-4">
        {/* Loading and error states */}
        {loading && <p className="text-gray-500 text-center">Loading orders...</p>}
        {error && <p className="text-red-700 py-3 border border-red-300 bg-red-100 text-center my-2 rounded-lg">{error}</p>}
        {!loading && orders.length === 0 && !error && (
          <p className="text-gray-500 text-center text-lg">No orders found.</p>
        )}

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order, i) => {
            const imageUrl = getOrderImage(order);
            return (
              <div
                key={order.id || i}
                className="flex justify-between items-start border-b border-gray-100 pb-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={order.name || order.product?.name || "Order image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800">
                      {order.name || order.product_name || order.product?.name || "Unnamed Product"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Order no: {order.orderNo || order.order_number || order.id}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(order.date || order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {order.status === "Delivered" && (
                  <button className="text-pink-600 text-xs font-medium">Rate product</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Orders;
