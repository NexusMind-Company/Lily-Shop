import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Save, Info } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import { VendorPageLoader, VendorPageError, getErrorMessage } from "../../components/vendor/VendorErrorStates";
import { fetchCutoffSettings, updateCutoffSettings } from "../../services/vendorDashboardApi";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const TIMES = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const mockCutoff = { cutoff_day: "saturday", cutoff_time: "12:00", delivery_day: "monday", delivery_window_start: "10:00", delivery_window_end: "18:00", is_enabled: true };

const SelectField = ({ label, value, options, onChange }) => (
  <div>
    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-[#111813] dark:text-white focus:outline-none focus:border-[#4eb75e] capitalize">
      {options.map((opt) => <option key={opt} value={opt} className="capitalize">{opt.replace(/_/g, " ")}</option>)}
    </select>
  </div>
);

const VendorCutoffPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(mockCutoff);

  const { data: settings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["vendorCutoffSettings"],
    queryFn: fetchCutoffSettings,
    placeholderData: mockCutoff,
    retry: 2,
  });

  useEffect(() => { if (settings) setForm({ ...mockCutoff, ...settings }); }, [settings]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateCutoffSettings(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["vendorCutoffSettings"] }); toast.success("Cut-off settings saved!"); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  if (isLoading && !settings) return <VendorLayout title="Cut-off Times"><VendorPageLoader /></VendorLayout>;
  if (isError && !settings) return <VendorLayout title="Cut-off Times"><VendorPageError message={getErrorMessage(error)} onRetry={refetch} /></VendorLayout>;

  return (
    <VendorLayout title="Cut-off Times">
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3 flex gap-3">
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Order Deadline</p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">Orders placed after the cut-off time will be scheduled for the next delivery window.</p>
          </div>
        </div>

        <div className="bg-[#4eb75e]/10 border border-[#4eb75e]/20 rounded-2xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={14} className="text-[#4eb75e]" />
            <p className="text-xs font-bold text-[#4eb75e] uppercase tracking-wide">Customers will see</p>
          </div>
          <p className="text-sm font-bold text-[#111813] dark:text-white">
            "Orders must be placed before{" "}
            <span className="text-[#4eb75e] capitalize">{form.cutoff_day}</span>{" "}
            {form.cutoff_time} for{" "}
            <span className="text-[#4eb75e] capitalize">{form.delivery_day}</span>{" "}
            delivery"
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111813] dark:text-white">Enable Cut-off Times</p>
            <p className="text-xs text-gray-400">Automatically reject late orders</p>
          </div>
          <button onClick={() => set("is_enabled")(!form.is_enabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${form.is_enabled ? "bg-[#4eb75e]" : "bg-gray-200 dark:bg-gray-700"}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_enabled ? "right-1" : "left-1"}`} />
          </button>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">Order Deadline</h3>
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Cut-off Day" value={form.cutoff_day} options={DAYS} onChange={set("cutoff_day")} />
            <SelectField label="Cut-off Time" value={form.cutoff_time} options={TIMES} onChange={set("cutoff_time")} />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-[#111813] dark:text-white">Delivery Window</h3>
          <SelectField label="Delivery Day" value={form.delivery_day} options={DAYS} onChange={set("delivery_day")} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Window Start" value={form.delivery_window_start} options={TIMES} onChange={set("delivery_window_start")} />
            <SelectField label="Window End" value={form.delivery_window_end} options={TIMES} onChange={set("delivery_window_end")} />
          </div>
        </div>

        <button onClick={() => save()} disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors">
          <Save size={16} />
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </VendorLayout>
  );
};

export default VendorCutoffPage;