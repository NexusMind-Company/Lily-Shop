import {
  Camera,
  User,
  AtSign,
  Calendar,
  MapPin,
  Venus,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";


const GenderSelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const genders = ["Female", "Male", "Other"];

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between bg-gray-100 w-full rounded-lg px-3 py-3 text-sm sm:text-base"
      >
        <div className="flex items-center truncate">
          <Venus size={18} className="text-gray-500 mr-2 shrink-0" />
          <span className="truncate">{value ? value : "Select gender"}</span>
        </div>
        <ChevronDown size={16} className="text-gray-500 shrink-0" />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-md z-20">
          {genders.map((gender) => (
            <li
              key={gender}
              onClick={() => {
                onChange(gender.toLowerCase());
                setOpen(false);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {gender}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const EditProfile = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    birthday: "",
    location: "",
    gender: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = () => {
    console.log("Saved data:", form);
    alert("Profile saved!");
  };

  const navigate = useNavigate()

  return (
    <div className="bg-white min-h-screen text-gray-800 flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <ChevronLeft size={25} onClick={() => navigate(-1)} />
        <h2 className="font-semibold text-lg truncate">Edit Profile</h2>
        <button onClick={handleSave} className="text-lily font-semibold shrink-0">
          Save
        </button>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative w-24 h-24">
          <img
            src="/avatar.png"
            alt="Profile"
            className="w-full h-full rounded-full object-cover bg-black"
          />
          <div className="absolute top-[35%] right-[35%] text-white">
            <Camera size={30} />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mt-6 px-4 space-y-5 pb-10 w-full">
        {/* Name */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Name</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <User size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
            />
          </div>
        </div>

        {/* Username */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Username</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <AtSign size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Bio</label>
          <input
            type="text"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="bg-gray-100 w-full rounded-lg px-3 py-3 mt-1 outline-none text-sm sm:text-base min-w-0"
          />
        </div>

        {/* Birthday */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Birthday</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <Calendar size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => handleChange("birthday", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
            />
          </div>
        </div>

        {/* Location */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Location</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <MapPin size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Select location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
            />
          </div>
        </div>

        {/* Gender (Custom Dropdown) */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
          <GenderSelect
            value={
              form.gender
                ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
                : ""
            }
            onChange={(val) => handleChange("gender", val)}
          />
        </div>
      </div>
    </div>
  );
};




export default EditProfile;
