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
  Mail,
  Phone,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { fetchProfile, updateProfileData } from "../../redux/profileSlice";
import {
  fetchUserProfileFormData,
  updateUsername,
  updateProfile,
} from "../../services/api";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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
                onChange(gender);
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
    email: "",
    bio: "",
    phone_number: "",
    birthday: "",
    gender: "",
  });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("/avatar.png");
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: user, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfileFormData"],
    queryFn: fetchUserProfileFormData,
  });

  useEffect(() => {
    if (user) {
      let displayGender = user.gender || "";
      if (user.gender === "F") displayGender = "Female";
      else if (user.gender === "M") displayGender = "Male";
      else if (user.gender === "NA") displayGender = "Other";

      setForm({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        phone_number: user.phone_number || "",
        birthday: user.birthdate || "",
        gender: displayGender,
      });

      if (user.profile_pic) {
        setProfileImagePreview(user.profile_pic);
      }
    }
  }, [user]);

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      let apiGender = null;
      if (form.gender === "Female") apiGender = "F";
      else if (form.gender === "Male") apiGender = "M";
      else if (form.gender === "Other") apiGender = "NA";

      const profilePayload = {};

      if (form.name && form.name.trim() !== "") profilePayload.name = form.name;
      if (form.bio && form.bio.trim() !== "") profilePayload.bio = form.bio;
      if (form.phone_number && form.phone_number.trim() !== "")
        profilePayload.phone_number = form.phone_number;
      if (apiGender) profilePayload.gender = apiGender;
      if (form.birthday && form.birthday.trim() !== "")
        profilePayload.birthdate = form.birthday;
      if (profileImageFile) profilePayload.profile_pic = profileImageFile;

      if (Object.keys(profilePayload).length > 0) {
        await updateProfile(profilePayload);
      }

      if (form.username && form.username !== user.username) {
        await updateUsername(form.username);
      }

      return true;
    },
    onSuccess: async () => {
      // React Query v5 requires object syntax for invalidateQueries
      queryClient.invalidateQueries({ queryKey: ["userProfileFormData"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });

      let apiGender = null;
      if (form.gender === "Female") apiGender = "F";
      else if (form.gender === "Male") apiGender = "M";
      else if (form.gender === "Other") apiGender = "NA";

      // Optimistically update Redux state
      const optimisticUpdate = {
        name: form.name,
        username: form.username,
        bio: form.bio,
        phone_number: form.phone_number,
        birthdate: form.birthday,
      };
      if (apiGender) optimisticUpdate.gender = apiGender;
      if (profileImageFile) optimisticUpdate.profile_pic = profileImagePreview;

      dispatch(updateProfileData(optimisticUpdate));

      // Await fresh profile data from the server before navigating back,
      // so the profile page has updated Redux state on mount.
      await dispatch(fetchProfile());
      toast.success("Profile updated successfully!");
      navigate(-1);
    },
    onError: (error) => {
      console.error("Failed to save profile:", error);
      const serverMessage = error.response?.data
        ? JSON.stringify(error.response.data)
        : null;
      const msg = serverMessage || error.message || "Failed to update profile.";
      toast.error(msg);
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
      <div className="flex items-center justify-between px-4 py-3 w-full">
        <ChevronLeft
          size={25}
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        />
        <h2 className="font-semibold text-lg truncate">Edit Profile</h2>
        <div className="w-6.25" />
      </div>

      <div className="flex flex-col items-center mt-6 px-4">
        <div className="relative w-24 h-24">
          <img
            src={profileImagePreview}
            alt="Profile"
            className="w-full h-full rounded-full object-cover bg-gray-200"
          />

          <label
            htmlFor="profile-pic-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer"
          >
            <div className="animate-pulse">
              <Camera size={30} className="text-white opacity-90" />
            </div>
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

      <fieldset
        disabled={isSaving}
        className="mt-6 px-4 space-y-5 pb-10 w-full"
      >
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
        </div>

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

        <div className="w-full opacity-60">
          <label className="block text-sm font-medium text-gray-600">
            Email Address (Cannot be changed here)
          </label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1 cursor-not-allowed">
            <Mail size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="email"
              value={form.email}
              disabled
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0 cursor-not-allowed text-gray-500"
              placeholder="Your email address"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">
            Phone Number
          </label>
          <div className="bg-gray-100 rounded-lg px-3 py-3 mt-1">
            <PhoneInput
              international
              defaultCountry="NG"
              value={form.phone_number}
              onChange={(value) => handleChange("phone_number", value || "")}
              className="w-full bg-transparent outline-none text-sm sm:text-base"
              style={{
                "--PhoneInput-color--focus": "transparent",
              }}
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-600">Bio</label>
          <input
            type="text"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="bg-gray-100 w-full rounded-lg px-3 py-3 mt-1 outline-none text-sm sm:text-base min-w-0"
            placeholder="Tell us about yourself..."
          />
        </div>

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
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0 text-[#111813]"
            />
          </div>
        </div>

        <div className="w-full opacity-60">
          <label className="block text-sm font-medium text-gray-600">
            Location
          </label>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-3 mt-1 cursor-not-allowed">
            <MapPin size={18} className="text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              value="Coming soon"
              disabled
              className="bg-transparent w-full outline-none text-sm sm:text-base min-w-0 cursor-not-allowed text-gray-500"
            />
          </div>
        </div>

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
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-lily text-white font-bold text-xl py-4 rounded-2xl mt-10 mb-6 flex items-center justify-center disabled:opacity-50 transition-colors shadow-lg shadow-lily/20"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save"}
        </button>
      </fieldset>
    </div>
  );
};

export default EditProfile;
