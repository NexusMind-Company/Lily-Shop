import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Save } from "lucide-react";
import toast from "react-hot-toast";
import VendorLayout from "../../components/vendor/VendorLayout";
import {
  VendorPageLoader,
  VendorPageError,
  getErrorMessage,
} from "../../components/vendor/VendorErrorStates";
import {
  fetchCutoffSettings,
  updateCutoffSettings,
} from "../../services/vendorDashboardApi";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];
const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const SelectRow = ({ label, hint, value, options, onChange, renderLabel }) => (
  <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100 ">
    <h3 className="text-sm font-bold text-[#111813]  mb-0.5">{label}</h3>
    {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            value === opt
              ? "bg-[#4eb75e] text-white shadow-sm"
              : "bg-gray-50  text-gray-500 border border-gray-100 "
          }`}
        >
          {renderLabel ? renderLabel(opt) : opt}
        </button>
      ))}
    </div>
  </div>
);

const VendorCutoffPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["cutoffSettings"],
    queryFn: fetchCutoffSettings,
  });

  const [form, setForm] = useState({
    cutoff_day: "saturday",
    cutoff_time: "12:00",
    delivery_day: "monday",
    delivery_window_start: "10:00",
    delivery_window_end: "18:00",
    is_enabled: true,
  });

  useEffect(() => {
    if (data) {
      setForm({
        cutoff_day: data.cutoff_day ?? "saturday",
        cutoff_time: data.cutoff_time ?? "12:00",
        delivery_day: data.delivery_day ?? "monday",
        delivery_window_start: data.delivery_window_start ?? "10:00",
        delivery_window_end: data.delivery_window_end ?? "18:00",
        is_enabled: data.is_enabled ?? true,
      });
    }
  }, [data]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateCutoffSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cutoffSettings"] });
      toast.success("Cut-off settings saved!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  if (isLoading && !data)
    return (
      <VendorLayout title="Cut-off Times">
        <VendorPageLoader />
      </VendorLayout>
    );
  if (isError && !data)
    return (
      <VendorLayout title="Cut-off Times">
        <VendorPageError message={getErrorMessage(error)} onRetry={refetch} />
      </VendorLayout>
    );

  return (
    <VendorLayout title="Cut-off Times">
      <div className="space-y-4">
        {/* Enable toggle */}
        <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100  flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111813] ">
              Enable Cut-off Rules
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Stop accepting new orders after the cut-off time
            </p>
          </div>
          <button
            onClick={() =>
              setForm((f) => ({ ...f, is_enabled: !f.is_enabled }))
            }
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${form.is_enabled ? "bg-[#4eb75e]" : "bg-gray-200 "}`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_enabled ? "right-1" : "left-1"}`}
            />
          </button>
        </div>

        {form.is_enabled && (
          <>
            <div className="flex items-start gap-2 bg-blue-50  border border-blue-100  rounded-2xl px-4 py-3">
              <Clock size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-600  leading-relaxed">
                Orders placed after the cut-off time on your cut-off day won't
                be included in that week's delivery cycle.
              </p>
            </div>

            <SelectRow
              label="Cut-off Day"
              hint="Last day customers can place orders for the next cycle"
              value={form.cutoff_day}
              options={DAYS}
              onChange={set("cutoff_day")}
              renderLabel={(d) => DAY_LABELS[d]}
            />

            <SelectRow
              label="Cut-off Time"
              hint="Orders after this time won't be included"
              value={form.cutoff_time}
              options={TIMES}
              onChange={set("cutoff_time")}
            />

            <SelectRow
              label="Delivery Day"
              hint="Day you deliver to subscribers"
              value={form.delivery_day}
              options={DAYS}
              onChange={set("delivery_day")}
              renderLabel={(d) => DAY_LABELS[d]}
            />

            <div className="bg-white  rounded-2xl p-4 shadow-sm border border-gray-100 ">
              <h3 className="text-sm font-bold text-[#111813]  mb-0.5">
                Delivery Window
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Time range when you deliver on delivery day
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                    From
                  </label>
                  <select
                    value={form.delivery_window_start}
                    onChange={(e) =>
                      set("delivery_window_start")(e.target.value)
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e]"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block">
                    To
                  </label>
                  <select
                    value={form.delivery_window_end}
                    onChange={(e) => set("delivery_window_end")(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-100  bg-gray-50  text-sm text-[#111813]  focus:outline-none focus:border-[#4eb75e]"
                  >
                    {TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#4eb75e]/5 border border-[#4eb75e]/20 rounded-2xl p-4">
              <p className="text-xs font-semibold text-[#111813]  mb-2">
                Summary
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Orders must be placed by{" "}
                <span className="font-semibold text-[#111813]  capitalize">
                  {form.cutoff_day}
                </span>{" "}
                at{" "}
                <span className="font-semibold text-[#111813] ">
                  {form.cutoff_time}
                </span>
                . Delivery on{" "}
                <span className="font-semibold text-[#111813]  capitalize">
                  {form.delivery_day}
                </span>{" "}
                between{" "}
                <span className="font-semibold text-[#111813] ">
                  {form.delivery_window_start}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-[#111813] ">
                  {form.delivery_window_end}
                </span>
                .
              </p>
            </div>
          </>
        )}

        <button
          onClick={() => save()}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#4eb75e] text-white font-bold text-sm hover:bg-[#3da64d] disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </VendorLayout>
  );
};

export default VendorCutoffPage;
