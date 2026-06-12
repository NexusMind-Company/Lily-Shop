import React from "react";
import {
  MapPin,
  Layout,
  Maximize2,
  Minimize2,
  PlusCircle,
  Link as IconLink,
} from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const VendorDashboardHeader = ({ profile, style, onToggle, onEdit }) => {
  const vendorId = useSelector((state) => state.profile.data?.user?.vendor_id);

  if (!profile) return null;

  const hasBanner = !!profile.banner_image;
  const bannerImage = profile.banner_image;
  const logoImage =
    profile.profile_image || profile.logo || profile.image || null;
  const name = profile.name || "Vendor Name";
  const cuisine = profile.cuisine || "Various Cuisines";
  const location =
    profile.street_address ||
    profile.address ||
    (profile.state && profile.lga
      ? `${profile.lga}, ${profile.state}`
      : "Location not set");

  const initials =
    name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "NA";

  if (style === "compact") {
    return (
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-gray-900 bg-white shadow-sm">
        {/* Blurred Banner Background */}
        <div
          className={`absolute inset-0 opacity-10 ${hasBanner ? "bg-cover bg-center blur-sm" : "bg-linear-to-r from-lily to-green-300"}`}
          style={hasBanner ? { backgroundImage: `url(${bannerImage})` } : {}}
        />

        <div className="relative flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-lily overflow-hidden bg-white shrink-0">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-black font-bold text-sm">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                  Welcome back 👋
                </p>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <p className="text-xs text-lily font-bold uppercase tracking-wider">
                  {cuisine}
                </p>
              </div>
              <h2 className="text-xl font-bold text-black">{name}</h2>
              {vendorId && (
                <div
                  className="flex items-center gap-1 text-gray-400 text-[10px] cursor-pointer hover:text-lily transition-colors w-fit"
                  onClick={() => {
                    const profileUrl = `${window.location.origin}/vendor-subscription/${vendorId}`;
                    navigator.clipboard.writeText(profileUrl);
                    toast.success("Subscription link copied!");
                  }}
                >
                  <span className="font-medium">Copy subscription link</span>
                  <IconLink size={10} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
              title="Switch to Hero View"
            >
              <Maximize2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: Hero Style
  return (
    <div className="mb-8">
      {/* Banner Section */}
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-900 group shadow-md bg-gray-50 flex items-center justify-center">
        {hasBanner ? (
          <>
            <img
              src={bannerImage}
              alt="Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-[#f6f8f6] to-[#e9eee9] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-3xl p-6 text-center transition-colors hover:bg-gray-50">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md text-sm font-bold text-gray-700 hover:text-lily transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle size={18} />
              Add Banner Image
            </button>
            <p className="text-xs text-gray-400 mt-2 max-w-xs">
              Personalize your dashboard and storefront by adding a beautiful
              banner image.
            </p>
          </div>
        )}

        {/* Toggle Button Over Banner */}
        <button
          onClick={onToggle}
          className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/90 hover:bg-white border border-gray-200 text-black shadow-lg transition-all transform hover:scale-105 active:scale-95"
          title="Switch to Compact View"
        >
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 md:px-10 -mt-12 md:-mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-end gap-5">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white overflow-hidden bg-white shadow-xl">
            {logoImage ? (
              <img
                src={logoImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-black font-black text-2xl md:text-4xl">
                {initials}
              </div>
            )}
          </div>

          <div className="pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-lily/10 text-lily text-[10px] font-bold uppercase tracking-wider">
                {cuisine}
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                <MapPin size={12} />
                <span>{location}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">
              {name}
            </h1>
            {vendorId && (
              <div
                className="flex items-center gap-1 text-gray-400 text-sm mt-1 cursor-pointer hover:text-lily transition-colors w-fit"
                onClick={() => {
                  const profileUrl = `${window.location.origin}/vendor-subscription/${vendorId}`;
                  navigator.clipboard.writeText(profileUrl);
                  toast.success("Subscription link copied!");
                }}
              >
                <span className="font-medium">Copy subscription link</span>
                <IconLink size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardHeader;
