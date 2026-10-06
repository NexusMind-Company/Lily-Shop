import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Activity, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

const SystemHealthPage = () => {
  const [activeTab, setActiveTab] = useState("webhooks"); // "webhooks" | "errors"

  const { data: webhooks, isLoading: isWebhooksLoading } = useQuery({
    queryKey: ["webhookLogs"],
    queryFn: async () => {
      const response = await api.get("/staff/webhook-logs/");
      return response.data.results || response.data;
    },
  });

  const { data: errorLogs, isLoading: isErrorsLoading } = useQuery({
    queryKey: ["systemErrorLogs"],
    queryFn: async () => {
      const response = await api.get("/staff/error-logs/");
      return response.data.results || response.data;
    },
  });

  return (
    <div className="min-h-screen bg-transparent p-5 lg:p-8 font-display">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-lily" />
          System Health & Logs
        </h1>
        <p className="text-gray-500 mt-1">Monitor webhooks, background tasks, and API error rates.</p>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "webhooks" ? "bg-lily text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Paystack Webhooks
        </button>
        <button
          onClick={() => setActiveTab("errors")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === "errors" ? "bg-lily text-white" : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          API Error Logs (500s)
        </button>
      </div>

      {activeTab === "webhooks" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Event Type</th>
                  <th className="p-4 font-bold">Provider</th>
                  <th className="p-4 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isWebhooksLoading ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-400">Loading webhooks...</td></tr>
                ) : webhooks?.length === 0 ? (
                  <tr><td colSpan="4" className="p-6 text-center text-gray-400">No webhooks recorded.</td></tr>
                ) : (
                  webhooks?.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        {log.status === "success" && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3" /> Success</span>}
                        {log.status === "failed" && <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md"><XCircle className="w-3 h-3" /> Failed</span>}
                        {log.status === "ignored" && <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Ignored</span>}
                        {log.status === "pending" && <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Clock className="w-3 h-3" /> Pending</span>}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-800">{log.event_type}</td>
                      <td className="p-4 text-sm text-gray-500 capitalize">{log.provider}</td>
                      <td className="p-4 text-sm text-gray-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "errors" && (
        <div className="space-y-4">
          {isErrorsLoading ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">Loading errors...</div>
          ) : errorLogs?.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">No critical errors logged. Looking good!</div>
          ) : (
            errorLogs?.map((err) => (
              <div key={err.id} className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {err.error_type}
                    </h3>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{err.error_message}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{new Date(err.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs font-mono text-gray-600 mt-3 flex items-center justify-between">
                  <span>{err.method} {err.endpoint}</span>
                  {err.user && <span className="text-lily bg-lily/10 px-2 py-1 rounded-md">User ID: {err.user}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SystemHealthPage;
