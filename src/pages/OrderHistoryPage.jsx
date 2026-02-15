import PageSEO from "../components/common/PageSEO";
import Orders from "../components/inbox/orders";
import { useSelector } from "react-redux";
import { selectOrders, selectOrderLoading, selectOrderError } from "../redux/orderSlice";

const OrderHistoryPage = () => {
  // Optional: you can still use these selectors here if you want to conditionally render messages
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  return (
    <>
      <PageSEO />
      <Orders />
      {/* Optional: show summary messages here if needed */}
      {loading && <p className="text-center mt-2">Fetching your orders...</p>}
      {error && <p className="text-red-700 text-center mt-2">{error}</p>}
      {!loading && orders.length === 0 && !error && (
        <p className="text-gray-500 text-center mt-2">No orders available.</p>
      )}
    </>
  );
};

export default OrderHistoryPage;