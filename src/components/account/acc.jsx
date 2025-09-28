import { User, Mail, Phone, Lock } from "lucide-react";

const userData = {
  name: "Jacob's Frosty",
  email: "jacob.frosty@email.com",
  phone: "+234 801 234 5678",
  membership: "Premium Member",
};

const Acc = () => {
  return (
    <section className="mt-14 min-h-screen flex flex-col px-4 md:px-7 gap-8 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <div className="rounded-2xl border border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-xl font-normal font-poppins">Account</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-auto">
        <img
          src="./profile-icon.svg"
          alt="Profile"
          className="w-[70px] h-[70px] rounded-full border-4 border-gray-200 shadow"
        />
      </div>

      {/* Account Info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 shadow border cursor-pointer px-5 py-4 rounded-2xl">
          <User className="text-blue-500" size={28} />
          <div>
            <h4 className="font-semibold text-gray-800">Full Name</h4>
            <p className="text-gray-500 text-sm">{userData.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shadow border cursor-pointer px-5 py-4 rounded-2xl">
          <Mail className="text-green-500" size={28} />
          <div>
            <h4 className="font-semibold text-gray-800">Email</h4>
            <p className="text-gray-500 text-sm">{userData.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shadow border cursor-pointer px-5 py-4 rounded-2xl">
          <Phone className="text-purple-500" size={28} />
          <div>
            <h4 className="font-semibold text-gray-800">Phone</h4>
            <p className="text-gray-500 text-sm">{userData.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shadow border cursor-pointer px-5 py-4 rounded-2xl">
          <Lock className="text-yellow-500" size={28} />
          <div>
            <h4 className="font-semibold text-gray-800">Password</h4>
            <p className="text-gray-500 text-sm">********</p>
          </div>
          <button className="ml-auto bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm">
            Change
          </button>
        </div>
      </div>
    </section>
  );
};

export default Acc;