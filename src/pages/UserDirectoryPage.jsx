import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { Search, UserX, UserCheck, ShieldCheck, BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";

const UserDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminDirectory", search],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      const response = await api.get("/staff/directory/users/", { params });
      return response.data.results || response.data;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId) => {
      await api.post(`/staff/directory/users/${userId}/suspend/`);
    },
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries(["adminDirectory"]);
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (vendorId) => {
      await api.post(`/staff/directory/vendors/${vendorId}/verify/`);
    },
    onSuccess: () => {
      toast.success("Vendor verification updated");
      queryClient.invalidateQueries(["adminDirectory"]);
    },
    onError: () => {
      toast.error("Failed to verify vendor");
    },
  });

  return (
    <div className="min-h-screen bg-transparent p-5 lg:p-8 font-display">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lily" />
            Vendors & Users Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage all platform users, vendors, and their permissions.</p>
        </div>
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search by name, username or email..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">Loading directory...</td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                          {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            {user.name || "Unknown"}
                            {user.vendor_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.is_vendor ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">
                          Vendor
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600">Suspended</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.is_vendor && (
                          <button
                            onClick={() => verifyMutation.mutate(user.vendor_id)}
                            disabled={verifyMutation.isPending}
                            className={`p-2 rounded-lg transition-colors border ${
                              user.vendor_verified 
                                ? "bg-white border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                : "bg-white border-blue-200 text-blue-500 hover:bg-blue-50"
                            }`}
                            title={user.vendor_verified ? "Remove Verification" : "Verify Vendor"}
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => suspendMutation.mutate(user.id)}
                          disabled={suspendMutation.isPending}
                          className={`p-2 rounded-lg transition-colors border ${
                            user.is_active 
                              ? "bg-white border-red-200 text-red-500 hover:bg-red-50" 
                              : "bg-white border-emerald-200 text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={user.is_active ? "Suspend User" : "Unsuspend User"}
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDirectoryPage;
