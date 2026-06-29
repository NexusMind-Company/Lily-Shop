import PropTypes from "prop-types";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MentionSuggestions from "../common/MentionSuggestions";
import { fetchShippingProfiles } from "../../services/shopApi";
import { Truck } from "lucide-react";

const ProductDetailsForm = ({ formData, setFormData }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  const updateField = useCallback(
    (patch) =>
      setFormData((prev) => ({
        ...prev,
        ...patch,
      })),
    [setFormData],
  );

  // Fetch vendor's shipping profiles
  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["shippingProfiles"],
    queryFn: fetchShippingProfiles,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const profilesList = useMemo(() => {
    return profiles?.results || (Array.isArray(profiles) ? profiles : []);
  }, [profiles]);

  // Pre-select default template on initial load if no profile ID is set
  useEffect(() => {
    if (profilesList.length > 0 && formData.shipping_profile_id === undefined) {
      const def = profilesList.find((p) => p.is_default);
      if (def) {
        updateField({ shipping_profile_id: def.id });
      } else {
        updateField({ shipping_profile_id: "" });
      }
    }
  }, [profilesList, formData.shipping_profile_id, updateField]);

  const selectedProfile = profilesList.find((p) => p.id === formData.shipping_profile_id);

  const handleCaptionChange = (e) => {
    const text = e.target.value;
    const pos = e.target.selectionStart;
    setCursorPos(pos);

    updateField({ caption: text });

    // Check for @ mention trigger
    const textBeforeCursor = text.substring(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      // Trigger if @ is at start or after a space
      const charBeforeAt = textBeforeCursor.charAt(lastAtIndex - 1);
      const isStartOrSpace = lastAtIndex === 0 || /\s/.test(charBeforeAt);

      if (isStartOrSpace) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(" ")) {
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectionChange = (e) => {
    setCursorPos(e.target.selectionStart);
  };

  const handleSelectMention = (username) => {
    const textBeforeCursor = (formData.caption || "").substring(0, cursorPos);
    const textAfterCursor = (formData.caption || "").substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const newText =
      textBeforeCursor.substring(0, lastAtIndex) +
      `@${username} ` +
      textAfterCursor;

    updateField({ caption: newText });
    setShowMentions(false);
  };

  return (
    <div className="mt-4 space-y-4">
      <h3 className="font-bold text-lg text-gray-900 mb-2">
        Product Details
      </h3>

      {/* Product Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 gap-1">
          <span className="text-red-500">* </span> Product Name
        </label>
        <input
          type="text"
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="e.g. Flowery Patterned Sundress"
          value={formData.name}
          onChange={(e) => updateField({ name: e.target.value })}
        />
        <p className="text-xs text-gray-400 mt-1">Max 50 characters</p>
      </div>

      {/* Caption/Description with Mentions */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caption (Supports @mentions)
        </label>
        <MentionSuggestions
          isOpen={showMentions}
          onClose={() => setShowMentions(false)}
          inputValue={formData.caption || ""}
          cursorPosition={cursorPos}
          onSelect={handleSelectMention}
        />
        <textarea
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="Describe your product... use @username to mention"
          value={formData.caption}
          onChange={handleCaptionChange}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
        />
      </div>

      {/* Price */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 gap-1">
          <span className="text-red-500">* </span>Price (₦)
        </label>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="0"
          value={formData.price}
          onChange={(e) => updateField({ price: e.target.value })}
        />
      </div>

      {/* In Stock */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          In Stock
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="inStock"
              checked={formData.inStock === true}
              onChange={() => updateField({ inStock: true })}
              className="mr-2 bg-lily"
            />
            Yes
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="inStock"
              checked={formData.inStock === false}
              onChange={() => updateField({ inStock: false })}
              className="mr-2 bg-lily"
            />
            No
          </label>
        </div>
      </div>

      {/* Quantity Available */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Available
        </label>
        <input
          type="number"
          min="0"
          inputMode="numeric"
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
          placeholder="0"
          value={formData.quantity_available}
          onChange={(e) => updateField({ quantity_available: e.target.value })}
          disabled={formData.inStock === false}
        />
      </div>

      {/* Shipping Template Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Shipping Template
          </label>
          <a
            href="/shipping-profiles"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-lily font-semibold hover:underline"
            title="Manage Shipping Templates"
          >
            <Truck size={14} />
            <span>Manage Templates</span>
          </a>
        </div>
        {loadingProfiles ? (
          <div className="text-xs text-gray-400">Loading shipping templates...</div>
        ) : profilesList.length > 0 ? (
          <div className="space-y-2">
            <select
              value={formData.shipping_profile_id || ""}
              onChange={(e) => {
                const val = e.target.value;
                updateField({
                  shipping_profile_id: val || null,
                });
              }}
              className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="">Custom Delivery Info (No Template)</option>
              {profilesList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_default ? "(Default)" : ""}
                </option>
              ))}
            </select>
            
            {selectedProfile && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs space-y-1">
                <p className="font-bold text-gray-700">Template: {selectedProfile.name}</p>
                {selectedProfile.base_processing_time && (
                  <p className="text-gray-500">Processing: {selectedProfile.base_processing_time}</p>
                )}
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {selectedProfile.zones?.map((zone) => (
                    <div key={zone.id || zone.zone_type} className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                      <p className="font-bold text-[9px] text-gray-400 uppercase">{zone.name}</p>
                      <p className="font-bold text-gray-700">₦{(zone.fee_naira ?? zone.fee ?? 0).toLocaleString()}</p>
                      <p className="text-gray-500 text-[10px]">{zone.est_days_min}-{zone.est_days_max} days</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No shipping templates found. Manage templates in your Vendor Dashboard settings.
          </div>
        )}
      </div>

      {/* Manual Delivery Info (only show if no shipping template is chosen) */}
      {!formData.shipping_profile_id && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Info
          </label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-lime-500"
            placeholder="Delivery to Lagos at ₦5000"
            value={formData.delivery_info || ""}
            onChange={(e) => updateField({ delivery_info: e.target.value })}
          />
        </div>
      )}

      {/* Promotable */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Promotable
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="promotable"
              checked={formData.promotable === true}
              onChange={() => updateField({ promotable: true })}
              className="mr-2 bg-lily"
            />
            Yes
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              name="promotable"
              checked={formData.promotable === false}
              onChange={() => updateField({ promotable: false })}
              className="mr-2 bg-lily"
            />
            No
          </label>
        </div>
      </div>
    </div>
  );
};

ProductDetailsForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    inStock: PropTypes.bool,
    quantity_available: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    delivery_info: PropTypes.string,
    promotable: PropTypes.bool,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default ProductDetailsForm;
