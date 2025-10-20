import { useState } from "react";
import { Edit2 } from "lucide-react";
import AccountInput from "./account-card";

const initialUserData = {
  displayName: "Ayokunle Ayeni",
  username: "@Ayo_d",
  profileImage: "./profile-icon.svg",
  bio: "Plumber & handyman. I fix leaks and make your home better. DM for bookings!",
  location: "Lagos, Nigeria",
  phone: "+234 801 234 5678",
  phonePublic: false,
  email: "ayokunle@email.com",
  instagram: "",
  tiktok: "",
  facebook: "",
  x: "",
  gender: "",
  birthday: "",
};

const Acc = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (field) => {
    setEditField(field);
    setTempValue(userData[field]);
  };

  const handleSave = (field) => {
    setUserData({ ...userData, [field]: tempValue });
    setEditField(null);
  };

  return (
    <section className="my-14 min-h-screen flex flex-col px-4 md:px-7 gap-8 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Account</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-auto flex flex-col items-center gap-2">
        <div className="relative">
          <img
            src={userData.profileImage}
            alt="Profile"
            className="w-[100px] h-[100px] rounded-full border-4 border-gray-200 shadow"
          />
          <button
            className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            onClick={() => handleEdit("profileImage")}
            title="Change Profile Picture">
            <Edit2 className="text-gray-700" size={18} />
          </button>
          {editField === "profileImage" && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 W-[200px] mt-2 bg-white p-4 rounded shadow flex-col items-center z-10">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setTempValue(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <div className="flex justify-center gap-5">
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-xs"
                onClick={() => {
                  setUserData({ ...userData, profileImage: tempValue });
                  setEditField(null);
                }}>
                Save
              </button>
              <button
                className="mt-2 text-xs rounded  bg-gray-100 hover:underline px-4 py-2"
                onClick={() => setEditField(null)}>
                Cancel
              </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <AccountInput
          icon={null}
          value={userData.displayName}
          label="Display Name"
          type="text"
          editField={editField}
          fieldName="displayName"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
        />

        <AccountInput
          value={userData.username}
          label="Username"
          type="text"
          editField={editField}
          fieldName="username"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={20}
        />

        <AccountInput
          icon={null}
          value={userData.bio}
          label="Bio"
          type="textarea"
          editField={editField}
          fieldName="bio"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={200}
          placeholder="Short description or tagline"
        />

        <AccountInput
          value={userData.location}
          label="Location"
          type="text"
          editField={editField}
          fieldName="location"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
        />

        <AccountInput
          value={userData.phone}
          label="Phone"
          type="text"
          editField={editField}
          fieldName="phone"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={20}></AccountInput>

        <AccountInput
          value={userData.email}
          label="Email"
          type="email"
          editField={editField}
          fieldName="email"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
        />

         <AccountInput
          value={userData.gender}
          label="Gender"
          type="select"
          editField={editField}
          fieldName="gender"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}>
          {editField === "gender" && (
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="border rounded px-2 py-1 text-sm">
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          )}
        </AccountInput>
        
        <AccountInput
          value={userData.birthday}
          label="Birthday"
          type="date"
          editField={editField}
          fieldName="birthday"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
        />

        <AccountInput
          value={
            userData.instagram ? (
              <a
                href={`https://instagram.com/${userData.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                @{userData.instagram}
              </a>
            ) : (
              ""
            )
          }
          label="Instagram"
          type="text"
          editField={editField}
          fieldName="instagram"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
          placeholder="tiktok username"
        />

        <AccountInput
          value={
            userData.facebook ? (
              <a
                href={`https://facebook.com/${userData.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                @{userData.facebook}
              </a>
            ) : (
              ""
            )
          }
          label="Facebook"
          type="text"
          editField={editField}
          fieldName="Facebook"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
          placeholder="Facebook username"
        />

        <AccountInput
          value={
            userData.tiktok ? (
              <a
                href={`https://instagram.com/${userData.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                @{userData.tiktok}
              </a>
            ) : (
              ""
            )
          }
          label="TikTok"
          type="text"
          editField={editField}
          fieldName="tiktok"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
          placeholder="tiktok username"
        />

        <AccountInput
          value={
            userData.x ? (
              <a
                href={`https://instagram.com/${userData.x}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline">
                @{userData.x}
              </a>
            ) : (
              ""
            )
          }
          label="X"
          type="text"
          editField={editField}
          fieldName="x"
          tempValue={tempValue}
          onEdit={handleEdit}
          onSave={handleSave}
          onChange={(e) => setTempValue(e.target.value)}
          maxLength={40}
          placeholder="X username"
        />

      </div>
    </section>
  );
};

export default Acc;
