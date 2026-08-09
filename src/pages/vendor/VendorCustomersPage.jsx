import { useQuery } from "@tanstack/react-query";
import { Users, Phone, MapPin, Receipt, Search, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError } from "../../components/vendor/VendorErrorStates";
import { fetchVendorOrders, fetchVendorSubscriptions } from "../../services/vendorDashboardApi";
import { formatPrice, formatDate } from "../../utils/formatters";

const VendorCustomersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ["vendorOrders", "all"],
    queryFn: () => fetchVendorOrders({ page_size: 100 }),
  });

  const { data: subsData, isLoading: isLoadingSubs, error: subsError } = useQuery({
    queryKey: ["vendorSubs", "all"],
    queryFn: () => fetchVendorSubscriptions({ page_size: 100 }),
  });

  const isLoading = isLoadingOrders || isLoadingSubs;
  const error = ordersError || subsError;

  const customers = useMemo(() => {
    if (!ordersData && !subsData) return [];
    
    const customerMap = new Map(); // key: phone or name
    
    const processItem = (item, type) => {
      const name = item.customer_name || item.user_name || item.buyer_name || "Unknown";
      const phone = item.phone || item.customer_phone || item.buyer_phone || "";
      const address = item.delivery_address || item.address || "";
      const amount = Number(item.total_amount_kobo ? item.total_amount_kobo / 100 : item.total_price_naira || item.price || 0);
      const date = item.created_at || item.start_date;
      
      const key = phone || name;
      
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name,
          phone,
          address,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: date,
          types: new Set()
        });
      }
      
      const cust = customerMap.get(key);
      cust.totalOrders += 1;
      cust.totalSpent += amount;
      cust.types.add(type);
      
      if (new Date(date) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = date;
        if (address) cust.address = address; // Keep latest address
      }
    };

    (ordersData?.results || []).forEach(order => processItem(order, "Order"));
    (subsData?.results || []).forEach(sub => processItem(sub, "Subscription"));
    
    return Array.from(customerMap.values())
      .filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.phone.includes(search)
      )
      .sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
  }, [ordersData, subsData, search]);

  if (isLoading) return <VendorPageLoader />;
  if (error) return <VendorPageError error={error} retry={() => window.location.reload()} />;

  return (
    <VendorLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 lg:hidden">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-lily w-6 h-6" />
                Customers
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 hidden lg:block">View and manage your customer list</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-lily text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold">No customers found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {search ? "Try a different search term" : "When people order from you, they'll show up here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customers.map((customer, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lily/10 flex items-center justify-center text-lily font-bold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {Array.from(customer.types).map(type => (
                          <span key={type} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="font-bold text-lily">₦{formatPrice(customer.totalSpent)}</p>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-50 text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Receipt className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Last active: {formatDate(customer.lastOrderDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

export default VendorCustomersPage;
