import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import useAuth from "../hooks/useAuth";
import displayError from "../utils/displayError";

const apiUrl = import.meta.env.VITE_API_URL;

const formatPhone = (num) => {
  const split = num.toString().split("");
  split.shift();
  split.unshift("+234");
  const newNum = split.join("");

  return newNum;
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  // const [error, setError] = useState([]);

  //User fields input
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");

  const isAuth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  //useAuth custom hooks
  const { login, signup, loading, error, data } = useAuth();

  //for navigation
  const navigate = useNavigate();

  //handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!username || !phoneNumber || !password) {
    //   setError([{ others: 'All input must be filled' }])
    //   return;
    // }

    // console.log(username, phoneNumber, password)
    // handleSubmitAsync(username, editNumber(phoneNumber), password);

    signup(apiUrl + "/auth/users", {
      username,
      phone_number: formatPhone(phoneNumber),
      password,
    });
  };

  useEffect(() => {
    if (data !== null) {
      dispatch(loginSuccess({ user_data: data }));
      navigate("/");
    }
  }, [data]);

  // //handling signup auth;
  // const handleSubmitAsync = async (user, phone, pass) => {
  //   setError([]);
  //   setSucessLoginMsg(false)

  //   try {
  //     const request = await axios.post(apiUrl + 'auth/users/', { username: user, phone_number: phone, password: pass })
  //     const response = { user, phone, pass }
  //     if (response.username) {
  //       setSucessLoginMsg(true)
  //       localStorage.setItem('username', response.username)
  //     }

  //     // cb(user, phone)

  //   } catch (err) {
  //     if (err.status == 400) {
  //       setError((prevState) => [...prevState, err.response.data])
  //       const error = err.response.data
  //       // setError()
  //       console.log(error)
  //     } else {
  //       setError([{ others: 'Network issue, TRY AGAIN !!!' }])
  //     }
  //   }
  // }

  //login after a user is signup
  // const login = async (user, pass) => {

  //   try {
  //     const request = await axios.post(apiUrl + '/auth/user_data/', { username: user, password: pass })
  //     const response = request.data;
  //     cconsole.log(response)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-2 border-sun">Regis</span>ter
      </h2>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* username  input */}
        <div className="flex flex-col">
          <input
            className="input rounded-none pt-0 h-[46px]"
            type="text"
            name="username"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-[#ff2b2b] font-bold">
            {displayError(error, "username")}
          </p>
        </div>

        {/* Phone number Input */}
        <div className="flex flex-col">
          <input
            className="input rounded-none pt-0 h-[46px]"
            type="number"
            name="number"
            placeholder="Phone Number"
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="text-[#ff2b2b] font-bold">
            {displayError(error, "phone_number")}
          </p>
        </div>

        {/* Password Input with Toggle Icon */}
        <div className="relative">
          <input
            className="input rounded-none pt-0 h-[46px] w-full pr-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        {/* error msg */}
        <p className="text-[#ff2b2b] font-bold">
          {displayError(error, "others")}
        </p>
        {/* Register Button */}

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px] hover:bg-lily hover:text-white cursor-pointer"
        >
          {loading ? "Loading ..." : "Register"}
        </button>
      </form>

      {/* Login Link */}
      <div className="font-inter text-xs font-medium">
        <Link to="/login">
          Already a member?{" "}
          <span className="text-lily font-semibold">Log In</span>
        </Link>
      </div>
    </section>
  );
};

export default SignUp;
