import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ChevronLeft, Loader2, Save, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { updateFoodVendor, fetchFoodVendor } from "../../services/api";
import { fetchProfile } from "../../redux/profileSlice";

const EditVendorProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profileData } = useSelector((state) => state.profile);
  const { user_data } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shop_name: "",
    description: "",
    address: "",
    category: "",
    contact_email: "",
    contact_phone: "",
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState("");

  const vendorId = profileData?.user?.vendor_id || user_data?.vendor_id;

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const data = await fetchFoodVendor(vendorId);
      setForm({
        shop_name: data.shop_name || "",
        description: data.description || "",
        address: data.address || "",
        category: data.category || "",
        contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
      });
      setProfileImagePreview(data.profile_pic || data.profile_image || "");
      setBannerImagePreview(data.banner_image || "");
    } catch (error) {
      console.error("Error loading vendor data:", error);
      toast.error("Failed to load vendor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImageFile(file);
      setBannerImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFoodVendor({
        shop_name: form.shop_name,
        description: form.description,
        address: form.address,
        category: form.category,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        banner_image: bannerImageFile || null,
        profile_image: profileImageFile || null,
      });
      toast.success("Vendor profile updated successfully!");
      dispatch(fetchProfile());
      navigate(-1);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      toast.error("Failed to update vendor profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white ">
        <Loader2 className="w-8 h-8 animate-spin text-lily" />
      </div>
    );
  }

  return (
    <div className="bg-white  min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 ">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="text-gray-800 " />
        </button>
        <h2 className="font-semibold text-lg text-gray-800 ">
          Edit Vendor Profile
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-lily font-semibold disabled:text-gray-400"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Banner Image
          </label>
          <div className="relative h-40 bg-gray-100  rounded-xl overflow-hidden">
            {bannerImagePreview ? (
              <img
                src={bannerImagePreview}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No banner image
              </div>
            )}
            <label
              htmlFor="banner-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera size={24} className="text-white" />
            </label>
            <input
              id="banner-upload"
              type="file"
              onChange={handleBannerImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 ">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
              >
                <Camera size={20} className="text-white" />
              </label>
              <input
                id="profile-upload"
                type="file"
                onChange={handleProfileImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 ">
              Click to change profile picture
            </p>
          </div>
        </div>

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Shop Name
          </label>
          <input
            type="text"
            value={form.shop_name}
            onChange={(e) => handleChange("shop_name", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter shop name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition resize-none"
            placeholder="Describe your food business"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter your address"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Category
          </label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="e.g., Nigerian, Italian, Fast Food"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Contact Email
          </label>
          <input
            type="email"
            value={form.contact_email}
            onChange={(e) => handleChange("contact_email", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter contact email"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={form.contact_phone}
            onChange={(e) => handleChange("contact_phone", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200  bg-white  text-gray-900  outline-none focus:border-lily transition"
            placeholder="Enter contact phone"
          />
        </div>
      </div>
    </div>
  );
};

export default EditVendorProfilePage;
