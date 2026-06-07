import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  User,
  Building,
  CreditCard,
  AlertCircle,
  Trash2,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getStaffWithdrawals,
  getUnprocessedWithdrawalRequests,
  markWithdrawalSuccessful,
  markWithdrawalUnsuccessful,
  getVendorsAsStaff,
  deleteVendorAsStaff,
} from "../services/api";

import { getVendorImageUrl } from "../utils/vendorUtils";

const StaffOperationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState("withdrawals");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: withdrawals,
    isLoading: isWithdrawalsLoading,
    refetch: refetchWithdrawals,
    isRefetching: isWithdrawalsRefetching,
  } = useQuery({
    queryKey: ["staffWithdrawals", activeTab, searchQuery],
    queryFn: async () => {
      const params = {};
      if (searchQuery) params.search = searchQuery;

      let res;
      try {
        if (activeTab === "pending") {
          res = await getUnprocessedWithdrawalRequests(params);
        } else {
          // For completed and failed, we use is_processed=true
          params.is_processed = "true";
          res = await getStaffWithdrawals(params);
        }
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
        return [];
      }

      const data = res?.results || res || [];

      // If we are in completed or failed tabs, filter by the status field in the results
      if (activeTab !== "pending") {
        return data.filter((item) => {
          const status = item.status?.toLowerCase();
          if (activeTab === "completed") {
            return (
              status === "completed" ||
              status === "success" ||
              status === "successful"
            );
          }
          if (activeTab === "failed") {
            return status === "failed" || status === "unsuccessful";
          }
          return false;
        });
      }

      return data;
    },
    enabled: mainTab === "withdrawals",
  });

  const {
    data: vendors,
    isLoading: isVendorsLoading,
    refetch: refetchVendors,
    isRefetching: isVendorsRefetching,
  } = useQuery({
    queryKey: ["staffVendors", searchQuery],
    queryFn: async () => {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const res = await getVendorsAsStaff(params);
      const data = res?.results || res;
      return Array.isArray(data) ? data : [];
    },
    enabled: mainTab === "vendors",
  });

  const successMutation = useMutation({
    mutationFn: markWithdrawalSuccessful,
    onSuccess: () => {
      toast.success("Withdrawal marked as successful");
      queryClient.invalidateQueries(["staffWithdrawals"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to update status");
    },
  });

  const failureMutation = useMutation({
    mutationFn: markWithdrawalUnsuccessful,
    onSuccess: () => {
      toast.success("Withdrawal marked as failed");
      queryClient.invalidateQueries(["staffWithdrawals"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to update status");
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: ({ vendorId, hard }) => deleteVendorAsStaff(vendorId, hard),
    onSuccess: (_, { hard }) => {
      toast.success(`Vendor ${hard ? "permanently" : "soft"} deleted`);
      queryClient.invalidateQueries(["staffVendors"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Failed to delete vendor");
    },
  });

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
      case "successful":
        return "text-lily bg-lily/10";
      case "failed":
      case "unsuccessful":
        return "text-red-500 bg-red-50";
      case "pending":
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8f6] font-display pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-7 h-7 text-gray-800" />
            </button>
            <h1 className="flex-1 text-center text-xl font-bold text-gray-900 pr-8">
              Staff Operations
            </h1>
            <button
              onClick={() => {
                if (mainTab === "withdrawals") refetchWithdrawals();
                if (mainTab === "vendors") refetchVendors();
              }}
              disabled={isWithdrawalsRefetching || isVendorsRefetching}
              className="absolute right-4 p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-400 ${
                  isWithdrawalsRefetching || isVendorsRefetching
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Main Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMainTab("withdrawals")}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mainTab === "withdrawals" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-500 border border-gray-100"}`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setMainTab("vendors")}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${mainTab === "vendors" ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-500 border border-gray-100"}`}
          >
            Vendors
          </button>
        </div>

        {mainTab === "withdrawals" && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Withdrawal Requests
              </h2>
              <p className="text-gray-500">
                Manage and process platform withdrawal requests.
              </p>
            </div>

            {/* Search and Tabs */}
            <div className="space-y-6 mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username, reference or bank..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:border-lily outline-none transition-all shadow-sm"
                />
              </div>

              <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                {["pending", "completed", "failed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-lily text-white shadow-lg shadow-lily/20"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {isWithdrawalsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-lily animate-spin" />
                  <p className="text-gray-400 font-medium">
                    Fetching requests...
                  </p>
                </div>
              ) : withdrawals && withdrawals.length > 0 ? (
                withdrawals.map((req, index) => (
                  <div
                    key={req.id || index}
                    className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Left: User Info */}
                      <div className="flex items-center gap-4 min-w-50">
                        <div className="w-14 h-14 rounded-2xl bg-[#f6f8f6] flex items-center justify-center border border-gray-50">
                          <User className="w-7 h-7 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-37.5">
                            {req.user_details?.username || req.user || "User"}
                          </p>
                          <p className="text-xs text-gray-400 font-semibold">
                            {new Date(req.created_at).toLocaleDateString()} at{" "}
                            {new Date(req.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Bank Details */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              Bank
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {req.bank_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              Account
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {req.account_number}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount and Actions */}
                      <div className="flex flex-col items-end gap-3 min-w-37.5">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(req.amount)}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(req.status)}`}
                          >
                            {req.status}
                          </span>
                        </div>

                        {activeTab === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => failureMutation.mutate(req.id)}
                              disabled={
                                failureMutation.isPending ||
                                successMutation.isPending
                              }
                              className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => successMutation.mutate(req.id)}
                              disabled={
                                successMutation.isPending ||
                                failureMutation.isPending
                              }
                              className="px-4 py-2 rounded-xl bg-lily text-white font-bold text-sm flex items-center gap-2 hover:brightness-105 shadow-lg shadow-lily/20 transition-all"
                            >
                              {successMutation.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>REF: {req.reference}</span>
                      {req.account_name && <span>{req.account_name}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-[#f6f8f6] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50">
                    <AlertCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold text-xl">
                    No {activeTab} requests
                  </p>
                  <p className="text-gray-400 text-sm font-medium">
                    When there are {activeTab} withdrawal requests, they'll show
                    up here.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {mainTab === "vendors" && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vendor Management
              </h2>
              <p className="text-gray-500">View and manage platform vendors.</p>
            </div>

            {/* Search */}
            <div className="mb-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search vendors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 focus:border-lily outline-none transition-all shadow-sm"
              />
            </div>

            {/* Content */}
            <div className="space-y-4">
              {isVendorsLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-lily animate-spin" />
                  <p className="text-gray-400 font-medium">
                    Fetching vendors...
                  </p>
                </div>
              ) : vendors && vendors.length > 0 ? (
                vendors.map((vendor, index) => (
                  <div
                    key={vendor.id || index}
                    className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Left: Vendor Info */}
                      <div className="flex items-center gap-4 min-w-50">
                        <div className="w-16 h-16 rounded-2xl bg-[#f6f8f6] flex items-center justify-center border border-gray-50 overflow-hidden">
                          {(() => {
                            const imageUrl = getVendorImageUrl(vendor);
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={vendor.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building className="w-8 h-8 text-gray-400" />
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {vendor.name}
                          </p>
                          <p className="text-xs text-gray-400 font-semibold truncate">
                            {vendor.cuisine || "No cuisine specified"}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              Location
                            </p>
                            <p className="text-sm font-bold text-gray-700 truncate">
                              {vendor.address || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                              Contact
                            </p>
                            <p className="text-sm font-bold text-gray-700">
                              {vendor.contact_phone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-row md:flex-col gap-2 min-w-37.5 justify-end">
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to soft delete ${vendor.name}?`,
                              )
                            ) {
                              deleteVendorMutation.mutate({
                                vendorId: vendor.id,
                                hard: false,
                              });
                            }
                          }}
                          disabled={deleteVendorMutation.isPending}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50 transition-all"
                        >
                          <Trash2 size={16} />
                          Soft Delete
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `WARNING: Are you sure you want to PERMANENTLY delete ${vendor.name}? This action cannot be undone.`,
                              )
                            ) {
                              deleteVendorMutation.mutate({
                                vendorId: vendor.id,
                                hard: true,
                              });
                            }
                          }}
                          disabled={deleteVendorMutation.isPending}
                          className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                        >
                          <Trash2 size={16} />
                          Hard Delete
                        </button>
                      </div>
                    </div>

                    {vendor.description && (
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {vendor.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-[#f6f8f6] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-50">
                    <AlertCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold text-xl">
                    No vendors found
                  </p>
                  <p className="text-gray-400 text-sm font-medium">
                    When there are vendors registered, they'll show up here.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffOperationsPage;
