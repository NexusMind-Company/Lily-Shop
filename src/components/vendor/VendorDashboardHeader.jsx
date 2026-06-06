import React from "react";
import { Edit3, MapPin, Layout, Maximize2, Minimize2 } from "lucide-react";

const VendorDashboardHeader = ({ profile, style, onToggle, onEdit }) => {
  if (!profile) return null;

  const bannerImage = profile.banner_image || "https://via.placeholder.com/1200x300?text=Vendor+Banner";
  const logoImage = profile.profile_image || profile.image_url || "https://via.placeholder.com/150?text=Logo";
  const name = profile.name || "Vendor Name";
  const cuisine = profile.cuisine || "Various Cuisines";
  const location = profile.street_address || profile.address || (profile.state && profile.lga ? `${profile.lga}, ${profile.state}` : "Location not set");

  if (style === "compact") {
    return (
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-gray-900 bg-white shadow-sm">
        {/* Blurred Banner Background */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${bannerImage})` }}
        />

        <div className="relative flex items-center justify-between p-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-lily overflow-hidden bg-white shrink-0">
              <img src={logoImage} alt={name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Welcome back 👋</p>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <p className="text-xs text-lily font-bold uppercase tracking-wider">{cuisine}</p>
              </div>
              <h2 className="text-xl font-bold text-black">{name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors"
              title="Edit Profile"
            >
              <Edit3 size={18} />
            </button>
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
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-900 group shadow-md">
        <img
          src={bannerImage}
          alt="Banner"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

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
            <img src={logoImage} alt={name} className="w-full h-full object-cover" />
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
            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">{name}</h1>
          </div>
        </div>

        <div className="pb-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-gray-800 text-white font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Edit3 size={18} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardHeader;
