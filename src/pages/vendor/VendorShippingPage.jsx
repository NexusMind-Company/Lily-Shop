import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Trash2, Save, X, Truck, Check, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  fetchShippingProfiles,
  createShippingProfile,
  updateShippingProfile,
  deleteShippingProfile,
} from "../../services/shopApi";

const ShippingLayout = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black transition">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Shipping Templates</h1>
        </div>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isDanger = false }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-md w-full border border-gray-150 p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isDanger ? 'bg-red-50 text-red-600' : 'bg-lily/10 text-lily'}`}>
              <Truck size={22} />
            </div>
            <h3 className="text-md font-bold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-250 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${isDanger ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-100' : 'bg-lily hover:bg-darklily shadow-md shadow-lily/15'}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const DEFAULT_ZONES = [
  { zone_type: "LOCAL", name: "Local (Same City)", fee: 1500, est_days_min: 1, est_days_max: 2 },
  { zone_type: "NATIONAL", name: "National (Nigeria)", fee: 4500, est_days_min: 3, est_days_max: 5 },
  { zone_type: "WORLDWIDE", name: "Worldwide", fee: 25000, est_days_min: 7, est_days_max: 14 }
];

const VendorShippingPage = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [baseProcessingTime, setBaseProcessingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [zones, setZones] = useState(DEFAULT_ZONES);

  // Fetch profiles
  const { data: profiles, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["shippingProfiles"],
    queryFn: fetchShippingProfiles,
  });

  const profilesList = profiles?.results || (Array.isArray(profiles) ? profiles : []);

  // Mutation to create a profile
  const createMutation = useMutation({
    mutationFn: createShippingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingProfiles"] });
      toast.success("Shipping profile created successfully!");
      resetForm();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to create profile");
    }
  });

  // Mutation to update a profile
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateShippingProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingProfiles"] });
      toast.success("Shipping profile updated successfully!");
      resetForm();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update profile");
    }
  });

  // Mutation to delete a profile
  const deleteMutation = useMutation({
    mutationFn: deleteShippingProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shippingProfiles"] });
      toast.success("Shipping profile deleted!");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to delete profile");
    }
  });

  const resetForm = () => {
    setName("");
    setBaseProcessingTime("");
    setNotes("");
    setIsDefault(false);
    setZones(DEFAULT_ZONES.map(z => ({ ...z })));
    setIsEditing(false);
    setEditingProfile(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (profile) => {
    setEditingProfile(profile);
    setName(profile.name || "");
    setBaseProcessingTime(profile.base_processing_time || "");
    setNotes(profile.notes || "");
    setIsDefault(profile.is_default || false);
    
    // Map zones from backend, fallback to default zones if missing
    const profileZones = DEFAULT_ZONES.map(dz => {
      const matchingZone = profile.zones?.find(z => z.zone_type === dz.zone_type);
      return {
        zone_type: dz.zone_type,
        name: matchingZone?.name || dz.name,
        fee: matchingZone?.fee_naira ?? matchingZone?.fee ?? dz.fee,
        est_days_min: matchingZone?.est_days_min ?? dz.est_days_min,
        est_days_max: matchingZone?.est_days_max ?? dz.est_days_max,
      };
    });
    setZones(profileZones);
    setIsEditing(true);
  };

  const handleZoneFieldChange = (index, field, value) => {
    setZones(prev => prev.map((zone, i) => {
      if (i !== index) return zone;
      
      let parsedValue = value;
      if (field === "fee") {
        parsedValue = value === "" ? "" : parseFloat(value);
      } else if (field === "est_days_min" || field === "est_days_max") {
        parsedValue = value === "" ? "" : parseInt(value, 10);
      }
      
      return { ...zone, [field]: parsedValue };
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    // Validate zones
    for (const zone of zones) {
      if (zone.fee === "" || isNaN(zone.fee) || zone.fee < 0) {
        toast.error(`Please enter a valid fee for ${zone.name}`);
        return;
      }
      if (zone.est_days_min === "" || isNaN(zone.est_days_min) || zone.est_days_min < 0) {
        toast.error(`Please enter valid min days for ${zone.name}`);
        return;
      }
      if (zone.est_days_max === "" || isNaN(zone.est_days_max) || zone.est_days_max < zone.est_days_min) {
        toast.error(`Please enter valid max days for ${zone.name} (must be >= min days)`);
        return;
      }
    }

    const payload = {
      name: name.trim(),
      base_processing_time: baseProcessingTime.trim() || null,
      notes: notes.trim() || null,
      is_default: isDefault,
      zones: zones.map(z => ({
        zone_type: z.zone_type,
        name: z.name,
        fee: Number(z.fee),
        est_days_min: Number(z.est_days_min),
        est_days_max: Number(z.est_days_max)
      }))
    };

    if (editingProfile) {
      updateMutation.mutate({ id: editingProfile.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleStartDelete = (id) => {
    setProfileToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete);
    }
    setDeleteModalOpen(false);
    setProfileToDelete(null);
  };

  const handleSetDefault = (profile) => {
    const payload = {
      name: profile.name,
      base_processing_time: profile.base_processing_time,
      notes: profile.notes,
      is_default: true,
      zones: profile.zones?.map(z => ({
        zone_type: z.zone_type,
        name: z.name,
        fee: z.fee_naira ?? z.fee,
        est_days_min: z.est_days_min,
        est_days_max: z.est_days_max
      }))
    };
    updateMutation.mutate({ id: profile.id, data: payload });
  };

  if (isLoading && !profiles) {
    return (
      <ShippingLayout>
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-lily border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ShippingLayout>
    );
  }

  if (isError && !profiles) {
    return (
      <ShippingLayout>
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl p-6">
          <p className="text-red-500 font-semibold mb-4">
            {getErrorMessage(error) || "Failed to load shipping templates."}
          </p>
          <button onClick={refetch} className="px-5 py-2.5 bg-lily text-white rounded-xl font-bold hover:bg-darklily transition">
            Try Again
          </button>
        </div>
      </ShippingLayout>
    );
  }

  return (
    <ShippingLayout>
      <div className="max-w-4xl mx-auto">
        
        {/* Banner */}
        <div className="bg-linear-to-r from-lily/25 to-lily/10 rounded-2xl p-6 mb-6 border border-lily/20">
          <div className="flex gap-4 items-start">
            <div className="bg-lily text-white p-3 rounded-xl shadow-md shrink-0">
              <Truck size={24} />
            </div>
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-black">Smart Shipping Templates</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create reusable templates with customized rates and delivery speeds for the three target customer segments:
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-700 bg-white/40 p-3.5 rounded-xl border border-white/30">
                <div>
                  <span className="font-bold text-black block mb-0.5">📍 Local (Same City)</span>
                  Applies when a buyer is ordering from the same state/city where your shop is located.
                </div>
                <div>
                  <span className="font-bold text-black block mb-0.5">🇳🇬 National (Nigeria)</span>
                  Applies when a buyer is in a different state within Nigeria.
                </div>
                <div>
                  <span className="font-bold text-black block mb-0.5">🌐 Worldwide (International)</span>
                  Applies when shipping to buyers ordering from outside Nigeria.
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="text-md font-bold text-black">
                {editingProfile ? "Edit Shipping Template" : "New Shipping Template"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-400 hover:text-black p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Delivery, Fast Shipping"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Base Processing Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 days, ships same day"
                  value={baseProcessingTime}
                  onChange={(e) => setBaseProcessingTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Special Delivery Notes (Optional)
              </label>
              <textarea
                placeholder="Any special notes or guidelines displayed to the buyer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-lily border-gray-300 rounded focus:ring-lily"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm font-semibold text-gray-700 select-none">
                Apply this template to my new products by default
              </label>
            </div>

            {/* Zone Rows */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-black uppercase tracking-wider">Shipping Zones</h4>
              
              <div className="grid grid-cols-1 gap-4">
                {zones.map((zone, idx) => (
                  <div key={zone.zone_type} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="md:w-1/3">
                      <p className="text-sm font-bold text-black">{zone.name}</p>
                      <p className="text-xs text-gray-500">Zone Type: {zone.zone_type}</p>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Fee (₦)</label>
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={zone.fee}
                          onChange={(e) => handleZoneFieldChange(idx, "fee", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Min Days</label>
                        <input
                          type="number"
                          placeholder="Min"
                          min="0"
                          value={zone.est_days_min}
                          onChange={(e) => handleZoneFieldChange(idx, "est_days_min", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">Max Days</label>
                        <input
                          type="number"
                          placeholder="Max"
                          min="0"
                          value={zone.est_days_max}
                          onChange={(e) => handleZoneFieldChange(idx, "est_days_max", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-lily focus:ring-1 focus:ring-lily outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 bg-lily text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-darklily transition shadow-md shadow-lily/15"
              >
                <Save size={16} />
                {editingProfile ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-black uppercase tracking-wider">
                Saved Templates ({profilesList.length})
              </h3>
              
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 bg-lily text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-darklily transition shadow-md shadow-lily/15"
              >
                <Plus size={14} />
                Add Template
              </button>
            </div>

            {profilesList.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                <Truck size={40} className="text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-black">No shipping templates yet</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Create shipping templates to allow automatic price calculations at checkout. Without a template, delivery costs cannot be calculated or included in the buyer's escrow payment automatically.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="mt-4 bg-lily text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-darklily transition"
                >
                  Create Your First Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {profilesList.map((profile) => (
                  <div
                    key={profile.id}
                    className={`bg-white rounded-2xl p-5 border shadow-sm transition-all relative ${
                      profile.is_default
                        ? "border-lily shadow-lily/5 ring-1 ring-lily/30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-black">{profile.name}</h4>
                          {profile.is_default && (
                            <span className="bg-lily/10 text-lily border border-lily/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                              <Check size={10} /> Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          {profile.base_processing_time && (
                            <span>Processing: <strong>{profile.base_processing_time}</strong></span>
                          )}
                          {profile.notes && (
                            <span className="truncate max-w-62.5" title={profile.notes}>
                              Notes: <em>{profile.notes}</em>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!profile.is_default && (
                          <button
                            onClick={() => handleSetDefault(profile)}
                            className="text-xs font-semibold text-lily hover:bg-lily/10 px-2.5 py-1.5 rounded-lg border border-lily/20 transition"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(profile)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="Edit Template"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleStartDelete(profile.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Zones display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                      {profile.zones?.map((zone) => (
                        <div key={zone.id || zone.zone_type} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{zone.name}</p>
                          <p className="text-sm font-bold text-black mt-1">
                            ₦{(zone.fee_naira ?? zone.fee ?? 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            Arrives in {zone.est_days_min}-{zone.est_days_max} days
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {profilesList.length > 0 && (
              <p className="text-[11px] text-gray-500 italic mt-4 text-center">
                * Note: Reusable shipping templates are required to enable automatic checkout calculations. Custom delivery notes (no template) cannot be calculated or included in the buyer's escrow total automatically.
              </p>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Shipping Template"
        message="Are you sure you want to delete this shipping template? Any product posts currently linked to this template will automatically fall back to standard/flat delivery rates."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProfileToDelete(null);
        }}
        isDanger={true}
      />
    </ShippingLayout>
  );
};

export default VendorShippingPage;
