import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

// API call
const createUsernameApi = async ({ contact, username }) => {
  const res = await fetch("/auth/username/set/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contact, username }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

const CreateUsername = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const contact = params.get("contact");
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const charLimit = 30;

  const mutation = useMutation({
    mutationFn: createUsernameApi,
    onSuccess: () => navigate("/dashboard"),
    onError: (err) => {
      setErrors({
        username: err.username?.[0],
        form: err.detail || "Something went wrong",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    if (!username) {
      setErrors({ username: "Username is required" });
      return;
    }
    if (username.includes(" ")) {
      setErrors({ username: "Username cannot contain spaces" });
      return;
    }
    mutation.mutate({ contact, username });
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Hero / Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-lily overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542060748-10c28722204b?q=80&w=2070&auto=format&fit=crop"
            alt="Virtual Store Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-lily/30 to-lily/90 mix-blend-multiply" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <h1 className="font-bold text-4xl uppercase tracking-wider">Lily Shops</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins leading-tight">
            Name Your <br /> Digital Store
          </h2>
          <p className="text-xl text-green-50 max-w-md">
            Choose a unique username to represent your store and brand on Lily Shop.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-70">
          © {new Date().getFullYear()} Lily Shops. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden flex items-center bg-white absolute top-0 left-0 right-0 h-16 px-6 shadow-sm z-40">
          <Link to="/">
            <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 xl:px-32 pt-24 lg:pt-0">
          <div className="max-w-md w-full mx-auto">
            {/* Title */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-poppins font-bold text-black text-3xl mb-3">
                Create Username
              </h2>
              <p className="font-poppins text-ash text-sm">
                Pick a unique username to represent your profile. It can include
                letters, numbers, and underscores, but no spaces. This will be how
                others find you.
              </p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md">
                <p className="text-sm">{errors.form}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    if (e.target.value.length <= charLimit) setUsername(e.target.value);
                  }}
                  placeholder="Choose a username"
                  className={`input w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white transition-all duration-200 outline-none ${errors.username
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-lily focus:ring-2 focus:ring-green-100"
                    }`}
                />
                <div className="flex justify-between text-xs text-ash mt-1">
                  <span className="text-red-500 h-4">{errors.username}</span>
                  <span>
                    {username.length}/{charLimit}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isLoading}
                className={`w-full py-4 rounded-full font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 ${mutation.isLoading
                  ? "bg-gray-400 cursor-not-allowed shadow-none"
                  : "bg-lily hover:bg-darklily hover:shadow-xl active:scale-[0.98]"
                  }`}
              >
                {mutation.isLoading ? "Creating..." : "Continue"}
              </button>
            </form>

            <div className="mt-8 flex justify-center lg:justify-start">
              <Link to={"/login"} className="flex items-center gap-2 group p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
                <img src="./arrowleft.png" alt="arrow" className="size-4 group-hover:-translate-x-1 transition-transform" />
                <p className="font-semibold text-black font-poppins text-sm group-hover:text-lily transition-colors">
                  Back to Log in
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUsername;
