import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

// API call
const createUsernameApi = async ({ contact, username }) => {
  const res = await fetch(
    "https://lily-shop-backend.onrender.com/auth/username/set/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, username }),
    }
  );
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
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      <div className="flex items-center bg-white absolute top-0 right-0 h-16 px-3 md:px-6 w-full shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Title */}
      <div className="grid place-items-center gap-3">
        <h2 className="font-poppins font-bold text-black text-center text-[25px]/[20px]">
          Create Username
        </h2>
        <p className="font-poppins font-bold text-center text-ash text-xs">
          Pick a unique username to represent your profile. It can include
          letters, numbers, and underscores, but no spaces. This will be how
          others find you
        </p>
      </div>

      {errors.form && (
        <p className="text-red-500 text-sm text-center">{errors.form}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => {
            if (e.target.value.length <= charLimit) setUsername(e.target.value);
          }}
          placeholder="Choose a username"
          className={`input rounded-[7px] h-[46px] w-full ${
            errors.username ? "border-red-500" : ""
          }`}
        />
        <div className="flex gap-2 text-xs self-start text-ash">
          <span>
            {username.length}/{charLimit}
          </span>
          <span className="text-red-500">{errors.username} </span>
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className={`h-[46px] rounded-full font-bold text-white ${
            mutation.isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {mutation.isLoading ? "Creating..." : "Continue"}
        </button>
      </form>

      {/* Back to login */}
      <div className="self-start">
        <Link to={"/login"} className="flex items-center gap-2">
          <img src="./arrowleft.png" alt="arrow" className="size-4" />
          <p className="font-semibold text-black font-poppins text-sm">
            Back to Log in
          </p>
        </Link>
      </div>
    </section>
  );
};

export default CreateUsername;
