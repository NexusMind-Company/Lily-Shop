import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Search,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  Bell,
  ShieldCheck,
  PackageCheck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
} from "../../components/vendor/VendorErrorStates";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  fetchVendorOrders,
  updateOrderStatus,
} from "../../services/vendorDashboardApi";
import usePushNotifications, { stopInstantOrderAudio } from "../../hooks/usePushNotifications";

const STATUS_COLORS = {
  paid: "bg-green-100 text-green-700 border-green-200",
  preparing: "bg-orange-100 text-orange-700 border-orange-200",
  ready_for_pickup: "bg-blue-100 text-blue-700 border-blue-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  dispatched: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS = {
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  out_for_delivery: "Out for Delivery",
  dispatched: "Dispatched",
  delivered: "Delivered",
  completed: "Completed",
  pending: "Pending",
};

const STATUS_BUTTON_COLORS = {
  preparing: "bg-lily hover:bg-darklily",
  ready_for_pickup: "bg-blue-600 hover:bg-blue-700",
  out_for_delivery: "bg-purple-600 hover:bg-purple-700",
  delivered: "bg-teal-600 hover:bg-teal-700",
};

const getNextStatuses = (currentStatus, deliveryType) => {
  const transitions = {
    paid: deliveryType === 'pickup' 
      ? ['preparing', 'ready_for_pickup'] 
      : ['preparing', 'out_for_delivery'],
    preparing: deliveryType === 'pickup'
      ? ['ready_for_pickup']
      : ['out_for_delivery'],
    pending: ['paid'], // fallback just in case testing needs it
  };
  return transitions[currentStatus] || [];
};

const OrderCard = ({ order, onStatusUpdate, isUpdating, isHighlighted }) => {
  const isAwaitingConfirmation =
    order.status === "out_for_delivery" ||
    order.status === "ready_for_pickup" ||
    order.status === "dispatched";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
        isHighlighted
          ? "border-lily ring-2 ring-lily/20 shadow-md"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-bold text-[#111813]">
              {order.customer_name}
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">{order.meal_plan ? order.meal_plan : "Immediate Order"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900">₦{(order.total_amount || (order.total_price ? order.total_price / 100 : 0) || order.price || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-2.5">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Phone size={13} className="mt-0.5 text-lily shrink-0" />
          <span>{order.phone}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <MapPin size={13} className="mt-0.5 text-lily shrink-0" />
          <span>{order.delivery_address || "Pickup"}</span>
        </div>
        {order.delivery_time && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Clock size={13} className="mt-0.5 text-lily shrink-0" />
            <span>Delivery: {order.delivery_time}</span>
          </div>
        )}
        
        {/* Out-for-delivery Escrow Protection banner replaces obsolete 4-digit PIN */}
        {isAwaitingConfirmation ? (
          <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/30 to-purple-50/60 border border-purple-100/90 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
              <ShieldCheck size={16} className="text-purple-600 shrink-0" />
              <span>Pending Customer Confirmation</span>
            </div>
            <p className="text-[11.5px] text-purple-800/90 leading-relaxed font-normal">
              Order is out for delivery. Escrow payment will be credited to your wallet immediately once the customer confirms delivery, or automatically released after 72 hours.
            </p>
          </div>
        ) : getNextStatuses(order.status, order.delivery_type).length > 0 ? (
          <div className="mt-3 space-y-2">
            {getNextStatuses(order.status, order.delivery_type).map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => onStatusUpdate(order.id, nextStatus)}
                disabled={isUpdating}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${STATUS_BUTTON_COLORS[nextStatus] || 'bg-lily'}`}
              >
                {isUpdating ? "Updating..." : `Mark as ${STATUS_LABELS[nextStatus]}`}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const VendorOrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams();
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const { notificationPermission, requestPushPermission } = usePushNotifications(true);

  useEffect(() => {
    stopInstantOrderAudio();
  }, []);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["vendorOrders"],
    queryFn: () => fetchVendorOrders(),
    staleTime: 1000 * 5,
    refetchInterval: 10000, // Auto-poll every 10 seconds for real-time updates
  });

  const orders = ordersData?.results ?? [];

  // Auto-switch to appropriate tab if navigating directly to an orderId from activity notification
  useEffect(() => {
    if (paramOrderId && orders.length > 0) {
      const targetOrder = orders.find(
        (o) => String(o.id) === String(paramOrderId)
      );
      if (targetOrder) {
        const isCompleted = [
          "delivered",
          "completed",
          "refunded",
          "cancelled",
          "failed",
          "success",
        ].includes(targetOrder.status?.toLowerCase());
        setActiveTab(isCompleted ? "completed" : "active");
      }
    }
  }, [paramOrderId, orders]);

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onMutate: ({ orderId }) => {
      setUpdatingId(orderId);
      stopInstantOrderAudio();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorOrders"] });
      toast.success("Order status updated!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => setUpdatingId(null),
  });

  const filtered = orders.filter((o) => {
    const matchesSearch = searchTerm ? o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const isCompleted = ['delivered', 'completed', 'refunded', 'cancelled', 'failed', 'success'].includes(o.status?.toLowerCase());
    const matchesTab = activeTab === "active" ? !isCompleted : isCompleted;
    return matchesSearch && matchesTab;
  });

  return (
    <VendorLayout title="Live Orders" showBack onBack={() => navigate(-1)}>
      {notificationPermission !== 'granted' && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <Bell size={16} className="text-amber-600 shrink-0" />
            <span>Enable sound & push notifications to get instant incoming order alarms.</span>
          </div>
          <button
            onClick={requestPushPermission}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 transition-colors"
          >
            Enable
          </button>
        </div>
      )}

      {/* Direct Order Notification Highlight Banner */}
      {paramOrderId && (
        <div className="mb-4 p-3 bg-lily/10 border border-lily/20 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold">
            <PackageCheck size={16} className="text-lily shrink-0" />
            <span>Viewing notification order #{paramOrderId.slice(0, 8)}</span>
          </div>
          <Link
            to="/vendor/dashboard/orders"
            className="px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-200 rounded-lg shrink-0 transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <X size={12} />
          </Link>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {["active", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${activeTab === tab ? "bg-lily text-white shadow-sm" : "bg-white text-gray-500 border border-gray-100"}`}
          >
            {tab} Orders
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-sm text-[#111813] placeholder-gray-400 focus:outline-none focus:border-lily"
        />
      </div>

      {ordersLoading && !ordersData ? (
        <VendorPageLoader />
      ) : ordersError && !ordersData ? (
        <VendorPageError
          message={getErrorMessage(ordersErr)}
          onRetry={refetchOrders}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl bg-white">
          {searchTerm ? "No orders match your search" : "No orders found"}
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isHighlighted={String(order.id) === String(paramOrderId)}
              isUpdating={updatingId === order.id}
              onStatusUpdate={(id, status) => updateStatus({ orderId: id, status })}
            />
          ))}
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorOrdersPage;
