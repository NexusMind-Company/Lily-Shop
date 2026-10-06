import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { ShieldAlert, AlertTriangle, MessageSquare, ExternalLink, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ResolutionCenterPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all"); // "all" | "dispute" | "feedback"
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["resolutionTickets"],
    queryFn: async () => {
      const response = await api.get("/staff/resolution-center/tickets/");
      return response.data.results || response.data;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ type, id, action, note }) => {
      await api.post(`/staff/resolution-center/tickets/${type}/${id}/action/`, { action, note });
    },
    onSuccess: () => {
      toast.success("Ticket resolved successfully!");
      queryClient.invalidateQueries(["resolutionTickets"]);
      setSelectedTicket(null);
      setResolutionNote("");
    },
    onError: () => {
      toast.error("Failed to process ticket action.");
    },
  });

  const filteredTickets = ticketsData?.filter(ticket => {
    if (activeTab === "all") return true;
    return ticket.type === activeTab;
  });

  const handleAction = (action) => {
    if (!selectedTicket) return;
    actionMutation.mutate({
      type: selectedTicket.type,
      id: selectedTicket.id,
      action,
      note: resolutionNote
    });
  };

  return (
    <div className="min-h-screen bg-transparent p-5 lg:p-8 font-display flex flex-col lg:flex-row gap-6">
      {/* Left Column: Ticket List */}
      <div className="flex-1 max-w-3xl flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-lily" />
            Resolution Center
          </h1>
          <p className="text-gray-500 mt-1">Review and resolve order disputes and platform feedback.</p>
        </div>

        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
          {["all", "dispute", "feedback"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? "bg-lily text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab === "all" ? "All Tickets" : `${tab}s`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">Loading tickets...</div>
          ) : filteredTickets?.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No pending tickets in this category.</div>
          ) : (
            filteredTickets?.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-2xl p-5 border shadow-sm cursor-pointer transition-all hover:border-lily hover:shadow-md ${
                  selectedTicket?.id === ticket.id ? "border-lily ring-2 ring-lily/20" : "border-gray-100"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {ticket.type === "dispute" ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <MessageSquare className="w-4 h-4 text-blue-500" />}
                    <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md capitalize ${
                    ticket.status.includes('resolved') || ticket.status === 'dismissed' 
                      ? 'bg-gray-100 text-gray-500' 
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                  <span>Reported by @{ticket.user_name}</span>
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Ticket Detail View */}
      <div className="w-full lg:w-96 flex-shrink-0">
        <div className="sticky top-6 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-120px)]">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <ShieldAlert className="w-12 h-12 mb-4 text-gray-200" />
              <p className="font-bold text-gray-500">Select a Ticket</p>
              <p className="text-sm mt-2">Click on any ticket from the list to view its details and take action.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {selectedTicket.type === "dispute" ? "Order Dispute" : "Platform Feedback"}
                  {selectedTicket.priority === "high" && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-sm">High Priority</span>}
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedTicket.title}</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">User:</span>
                    <span className="font-bold text-gray-900">@{selectedTicket.user_name}</span>
                  </div>
                  {selectedTicket.reference_id && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-500">Reference:</span>
                      <a href={`/orders/${selectedTicket.reference_id}`} className="font-bold text-lily flex items-center gap-1 hover:underline">
                        Order ID <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Submitted:</span>
                    <span className="font-bold text-gray-900">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolution Actions</h4>
                  
                  {selectedTicket.status.includes('resolved') || selectedTicket.status === 'dismissed' ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" /> This ticket is already closed.
                    </div>
                  ) : (
                    <>
                      <textarea
                        placeholder="Add internal resolution notes..."
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lily/20 focus:border-lily transition-all min-h-[100px]"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                      />
                      
                      {selectedTicket.type === "dispute" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleAction("resolve_buyer")}
                            disabled={actionMutation.isPending}
                            className="bg-lily text-white py-2.5 rounded-xl text-sm font-bold hover:bg-lily-dark transition-colors"
                          >
                            Favor Buyer
                          </button>
                          <button 
                            onClick={() => handleAction("resolve_seller")}
                            disabled={actionMutation.isPending}
                            className="bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Favor Seller
                          </button>
                          <button 
                            onClick={() => handleAction("escalate")}
                            disabled={actionMutation.isPending}
                            className="col-span-2 bg-rose-50 text-rose-600 border border-rose-200 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors mt-1"
                          >
                            Escalate to Admin
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => handleAction("resolve")}
                            disabled={actionMutation.isPending}
                            className="bg-lily text-white py-2.5 rounded-xl text-sm font-bold hover:bg-lily-dark transition-colors"
                          >
                            Mark Resolved
                          </button>
                          <button 
                            onClick={() => handleAction("dismiss")}
                            disabled={actionMutation.isPending}
                            className="bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolutionCenterPage;
