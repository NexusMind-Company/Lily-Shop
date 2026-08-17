import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Users, Phone, MapPin, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { formatPrice } from "../../utils/formatters";

// Fallback manual aggregation
const fetchVendorCustomersFallback = async () => {
  try {
    const response = await api.get(`/foods/subscriptions/vendor/`);
    const subscriptions = response.data.results || response.data || [];
    
    // Aggregate customers
    const customerMap = new Map();
    
    subscriptions.forEach(sub => {
      const customerInfo = sub.user || sub.customer; // adjust based on API payload
      const userId = customerInfo?.id || sub.user_id || sub.buyer_phone || "unknown";
      
      if (!customerMap.has(userId)) {
        customerMap.set(userId, {
          id: userId,
          name: customerInfo?.first_name 
            ? `${customerInfo.first_name} ${customerInfo.last_name || ""}`.trim() 
            : sub.buyer_name || "Unknown Customer",
          phone: customerInfo?.phone_number || sub.buyer_phone || "N/A",
          email: customerInfo?.email || sub.buyer_email || "N/A",
          address: sub.delivery_address || sub.address || "N/A",
          orders_count: 0,
          total_spent: 0,
        });
      }
      
      const customer = customerMap.get(userId);
      customer.orders_count += 1;
      customer.total_spent += Number(sub.price || sub.total_amount || 0);
    });
    
    return Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
  } catch (error) {
    console.error("Error fetching vendor customers:", error);
    return [];
  }
};

const VendorCustomersList = ({ vendorId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["vendorCustomers", vendorId],
    queryFn: fetchVendorCustomersFallback,
    enabled: Boolean(vendorId) && isExpanded,
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div 
        className="p-4 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Customer List</h2>
            <p className="text-sm text-gray-500">View all your unique customers</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </div>
      
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-lily border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-3 text-gray-300" />
              <p>No customers found yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Customer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold text-center">Orders</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{c.name}</div>
                      </td>
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} /> {c.phone}
                        </div>
                        {c.address && c.address !== "N/A" && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs truncate max-w-[200px]" title={c.address}>
                            <MapPin size={12} /> {c.address}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {c.orders_count}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lily">
                        ₦{formatPrice(c.total_spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorCustomersList;
