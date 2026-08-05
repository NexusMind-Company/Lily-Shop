import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
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
  confirmDelivery
} from "../../services/vendorDashboardApi";

const STATUS_COLORS = {
  preparing: "bg-orange-100 text-orange-700 border-orange-200",
  ready: "bg-blue-100 text-blue-700 border-blue-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-gray-100 text-gray-600 border-gray-200",
};
const STATUS_LABELS = {
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  pending: "Pending",
};

const OrderCard = ({ order, onStatusUpdate, onConfirmDelivery, isUpdating }) => {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  
  const isPending = order.status === "pending" || order.status === "preparing";
  const needsPin = order.status === "out_for_delivery" || order.status === "ready";
  const targetStatus = order.delivery_type === "pickup" ? "ready" : "out_for_delivery";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)}>
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
        <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Phone size={13} className="mt-0.5 text-lily shrink-0" />
            <span>{order.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <MapPin size={13} className="mt-0.5 text-lily shrink-0" />
            <span>{order.delivery_address || "Pickup"}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Clock size={13} className="mt-0.5 text-lily shrink-0" />
            <span>Delivery: {order.delivery_time}</span>
          </div>
          
          {needsPin ? (
            <div className="mt-2 space-y-2 border border-gray-100 p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-600 font-medium mb-1">Enter buyer's delivery PIN to confirm:</p>
              <input 
                type="text" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm tracking-widest text-center focus:outline-none focus:border-lily"
              />
              <button
                onClick={() => onConfirmDelivery(order.id, pin)}
                disabled={isUpdating || pin.length < 4}
                className="w-full py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? "Confirming..." : "Confirm Delivery"}
              </button>
            </div>
          ) : isPending ? (
            <button
              onClick={() => onStatusUpdate(order.id, targetStatus)}
              disabled={isUpdating}
              className="w-full py-2.5 rounded-xl bg-lily text-white text-xs font-bold mt-1 hover:bg-darklily disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? "Updating..." : "Dispatch Order"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

const VendorOrdersPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["vendorOrders"],
    queryFn: () => fetchVendorOrders(),
    staleTime: 1000 * 30,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onMutate: ({ orderId }) => setUpdatingId(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorOrders"] });
      toast.success("Order status updated!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => setUpdatingId(null),
  });

  const { mutate: confirmDel } = useMutation({
    mutationFn: ({ orderId, pin }) => confirmDelivery(orderId, { pin, gps_lat: 0, gps_lng: 0 }),
    onMutate: ({ orderId }) => setUpdatingId(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorOrders"] });
      toast.success("Delivery confirmed securely!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => setUpdatingId(null),
  });

  const orders = ordersData?.results ?? [];
  const filtered = orders.filter((o) => {
    const matchesSearch = searchTerm ? o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesTab = activeTab === "active" ? o.status !== "delivered" : o.status === "delivered";
    return matchesSearch && matchesTab;
  });

  return (
    <VendorLayout title="Live Orders" showBack onBack={() => navigate(-1)}>
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
              isUpdating={updatingId === order.id}
              onStatusUpdate={(id, status) => updateStatus({ orderId: id, status })}
              onConfirmDelivery={(id, pin) => confirmDel({ orderId: id, pin })}
            />
          ))}
        </div>
      )}
    </VendorLayout>
  );
};

export default VendorOrdersPage;
