import {
  Camera,
  User,
  AtSign,
  Calendar,
  MapPin,
  Venus,
  ChevronDown,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUsername,
  updateProfilePic,
} from "../../services/api"; // Adjust this path as needed

// GenderSelect component (no changes)
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

// Main EditProfile component
const EditProfile = () => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    birthday: "",
    location: "",
    gender: "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("/avatar.png");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetching the user's current profile data
  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5, // Cache profile for 5 mins
  });

  // populate form when data loads
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "", //TODO (Field might not exist in API)
        username: user.username || "",
        bio: user.bio || "", //TODO (Field might not exist in API)
        birthday: user.birthday || "", //TODO (Field might not exist in API)
        location: user.location || "", //TODO (Field might not exist in API)
        gender: user.gender || "", // TODO (Field might not exist in API)
      });
      if (user.profile_pic) {
        setProfileImagePreview(user.profile_pic);
      }
    }
  }, [user]);

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      let usernameUpdated = false;
      let picUpdated = false;

      if (form.username !== user.username) {
        await updateUsername(form.username);
        usernameUpdated = true;
      }

      if (profileImageFile) {
        await updateProfilePic(profileImageFile);
        picUpdated = true;
      }

      return { usernameUpdated, picUpdated };
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries(["userProfile"]);

      alert("Profile saved successfully!");
      navigate(-1);
    },
    onError: (error) => {
      console.error("Failed to save profile:", error);
      alert(`Error saving profile: ${error.message || "Please try again."}`);
    },
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    saveProfile();
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-lily" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-800 flex flex-col w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <ChevronLeft size={25} onClick={() => navigate(-1)} />
        <h2 className="font-semibold text-lg truncate">Edit Profile</h2>
        <button
          onClick={handleSave}
          className="text-lily font-semibold shrink-0 disabled:text-gray-400"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
        </button>
      </div>

      {/* Profile Image */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative w-24 h-24">
          <img
            src={profileImagePreview} // Show API image or local preview
            alt="Profile"
            className="w-full h-full rounded-full object-cover bg-gray-200"
          />
          {/* This label triggers the hidden file input */}
          <label
            htmlFor="profile-pic-upload"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black rounded-full cursor-pointer"
          >
            <Camera size={30} className="text-white" />
          </label>
          <input
            id="profile-pic-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/png, image/jpeg"
          />
        </div>
      </div>

      {/* Form */}
      <fieldset
        disabled={isSaving}
        className="mt-6 px-4 space-y-5 pb-10 w-full"
      >
        {/* Name */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Name
          </label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <User size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
              placeholder="Your full name"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-1"> Coming Soon!</p>
        </div>

        {/* Username */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Username
          </label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <AtSign size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
              placeholder="your_username"
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
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-400 mt-1 pl-1"> Coming Soon!</p>
        </div>

        {/* Birthday */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Birthday
          </label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <Calendar size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => handleChange("birthday", e.target.value)}
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 pl-1"> Coming Soon!</p>
        </div>

        {/* Location */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Location
          </label>
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
          <p className="text-xs text-gray-400 mt-1 pl-1"> Coming Soon!</p>
        </div>

        {/* Gender (Custom Dropdown) */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Gender
          </label>
          <GenderSelect
            value={
              form.gender
                ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
                : ""
            }
            onChange={(val) => handleChange("gender", val)}
          />
          <p className="text-xs text-gray-400 mt-1 pl-1"> Coming Soon!</p>
        </div>
      </fieldset>
    </div>
  );
};

export default EditProfile;
