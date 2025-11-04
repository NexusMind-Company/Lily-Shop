import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, resetCreateUserState } from "../../redux/createUserSlice";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";


const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, success, error } = useSelector((state) => state.createUser);
   const [showSuccess, setShowSuccess] = useState("");

  const [values, setValues] = useState({
    email_or_phonenumber: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { email_or_phonenumber, password } = values;
    const newErrors = {};

    if (!email_or_phonenumber)
      newErrors.email_or_phonenumber = "Phone number or email is required";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      dispatch(createUser(values));
    }
  };

  useEffect(() => {
    if (success) {
      dispatch(resetCreateUserState());
      setShowSuccess("Registeration successful. Please Login");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [success, navigate, values.email_or_phonenumber, dispatch]);

  return (
    <section className="mt-35 flex flex-col gap-7 px-7 max-h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center bg-white w-full absolute top-0 right-0 h-16 px-3 md:px-6 shadow-ash shadow z-40">
        <Link to="/">
          <h1 className="font-bold text-2xl text-lily uppercase">Lily Shops</h1>
        </Link>
      </div>

      {/* Page Title */}
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-[2px] border-solid pb-[2px] border-lily">
          Regis
        </span>
        ter
      </h2>


      {showSuccess && (
        <p className="text-green-700 py-3 border border-green-300 bg-green-100 text-center my-2 rounded-lg">
          {showSuccess}
        </p>
      )}

            {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 text-center my-2 rounded-lg py-3">
            {error}
          </p>
        )}


      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Phone or Email */}
        <div>
          <input
            type="text"
            name="email_or_phonenumber"
            value={values.email_or_phonenumber}
            onChange={handleChange}
            placeholder="Enter email"
            className={`input rounded-[7px] h-[46px] w-full ${
              errors.email_or_phonenumber ? "border-red-500" : ""
            }`}
          />
          {errors.email_or_phonenumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email_or_phonenumber}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="Enter Password"
            className={`input rounded-[7px] h-[46px] w-full pr-10 ${
              errors.password ? "border-red-500" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ash"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`h-[46px] rounded-full font-bold text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-lily hover:bg-darklily"
          }`}
        >
          {loading ? "Registering..." : "REGISTER"}
        </button>
      </form>

      {/* Login link */}
      <div className="font-inter text-sm font-bold">
        <Link to="/login">
          Already a member?{" "}
          <span className="text-lily font-bold underline">Log In</span>
        </Link>
      </div>
    </section>
  );
};

export default SignUp;

