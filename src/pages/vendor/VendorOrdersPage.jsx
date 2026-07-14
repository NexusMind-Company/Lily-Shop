import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Phone,
  MapPin,
  Clock,
  Package,
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
  fetchDailyPrepList,
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
const STATUS_FLOW = ["preparing", "ready", "out_for_delivery", "delivered"];

const OrderCard = ({ order, onStatusUpdate, onConfirmDelivery, isUpdating }) => {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];

  return (
    <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-bold text-[#111813] ">
              {order.customer_name}
            </p>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">{order.meal_plan}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-2.5 border-t border-gray-50  pt-3">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Phone size={13} className="mt-0.5 text-lily shrink-0" />
            <span>{order.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <MapPin size={13} className="mt-0.5 text-lily shrink-0" />
            <span>{order.delivery_address}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Clock size={13} className="mt-0.5 text-lily shrink-0" />
            <span>Delivery: {order.delivery_time}</span>
          </div>
          {nextStatus === "delivered" ? (
            <div className="mt-2 space-y-2 border border-gray-100 p-3 rounded-xl bg-gray-50">
              <p className="text-xs text-gray-600 font-medium mb-1">Enter buyer's delivery PIN to confirm:</p>
              <input 
                type="text" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm tracking-widest text-center"
              />
              <button
                onClick={() => onConfirmDelivery(order.id, pin)}
                disabled={isUpdating || pin.length < 4}
                className="w-full py-2 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? "Confirming..." : "Confirm Delivery"}
              </button>
            </div>
          ) : nextStatus && (
            <button
              onClick={() => onStatusUpdate(order.id, nextStatus)}
              disabled={isUpdating}
              className="w-full py-2.5 rounded-xl bg-lily text-white text-xs font-bold mt-1 hover:bg-darklily disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating
                ? "Updating..."
                : `Mark as ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const VendorOrdersPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("orders");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ["vendorOrders", filterStatus],
    queryFn: () =>
      fetchVendorOrders({
        status: filterStatus !== "all" ? filterStatus : undefined,
      }),
    staleTime: 1000 * 30,
  });

  const {
    data: prepList,
    isLoading: prepLoading,
    isError: prepError,
    error: prepErr,
    refetch: refetchPrep,
  } = useQuery({
    queryKey: ["dailyPrepList"],
    queryFn: fetchDailyPrepList,
    enabled: activeTab === "prep",
    staleTime: 1000 * 60,
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
  const prepItems = Array.isArray(prepList)
    ? prepList
    : (prepList?.results ?? []);
  const filtered = orders.filter((o) =>
    searchTerm
      ? o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : true,
  );

  return (
    <VendorLayout title="Orders">
      <div className="flex gap-2">
        {["orders", "prep"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-lily text-white shadow-sm" : "bg-white  text-gray-500 border border-gray-100 "}`}
          >
            {tab === "orders" ? "All Orders" : "Prep List"}
          </button>
        ))}
      </div>

      {activeTab === "orders" && (
        <>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-white  border border-gray-100  text-sm text-[#111813]  placeholder-gray-400 focus:outline-none focus:border-lily"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              "all",
              "pending",
              "preparing",
              "ready",
              "out_for_delivery",
              "delivered",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === s ? "bg-lily text-white" : "bg-white  border border-gray-100  text-gray-500"}`}
              >
                {STATUS_LABELS[s] ?? "All"}
              </button>
            ))}
          </div>

          {ordersLoading && !ordersData ? (
            <VendorPageLoader />
          ) : ordersError && !ordersData ? (
            <VendorPageError
              message={getErrorMessage(ordersErr)}
              onRetry={refetchOrders}
            />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {searchTerm ? "No orders match your search" : "No orders found"}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isUpdating={updatingId === order.id}
                  onStatusUpdate={(id, status) =>
                    updateStatus({ orderId: id, status })
                  }
                  onConfirmDelivery={(id, pin) => confirmDel({ orderId: id, pin })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "prep" && (
        <>
          {prepLoading && !prepList ? (
            <VendorPageLoader />
          ) : prepError && !prepList ? (
            <VendorPageError
              message={getErrorMessage(prepErr)}
              onRetry={refetchPrep}
            />
          ) : (
            <div className="space-y-3">
              <div className="bg-lily/10 border border-lily/20 rounded-xl px-4 py-3">
                <p className="text-sm font-bold text-lily">
                  Today's Preparation List
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date().toLocaleDateString("en-NG", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {prepItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#111813]  truncate">
                      {item.meal_name}
                    </p>
                    <p className="text-xs text-gray-400">{item.meal_plan}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-xl font-bold text-lily">
                      {item.quantity}
                    </p>
                    <p className="text-[10px] text-gray-400">portions</p>
                  </div>
                </div>
              ))}

              <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100 ">
                <p className="text-xs text-gray-500 font-medium">
                  Total portions to prepare:
                </p>
                <p className="text-2xl font-bold text-[#111813]  mt-1">
                  {prepItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0)}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </VendorLayout>
  );
};

export default VendorOrdersPage;
