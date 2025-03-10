import { useState } from "react";
import { Link } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';

const SignUp = () => {
  const URL = 'https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/swagger/'

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null)

  //User fields input
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('')
  const [username, setUsername] = useState('')

  const isAuth = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  //handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(password, phoneNumber, username)
    handleSubmitAsync(username, phoneNumber, password);

  }

  //submit new user
  const handleSubmitAsync = async (user, phone, pass) => {

    console.log(user, phone, pass)

    if (user && phone && pass) {
      const response = await axios.post(URL + 'auth/users', { user, phone, pass })
      const data = await response.data
      console.log(data)
      // return
    }

    // setError('input fields must be filled')

  }
  return (
    <section className="mt-10 flex flex-col gap-7 px-7">
      <h2 className="font-poppins font-bold text-black text-xl/[30px]">
        <span className="border-b-2 border-sun">Regis</span>ter
      </h2>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {/* username  input */}
        <input
          className="input rounded-none pt-0 h-[46px]"
          type="text"
          name="username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Phone number Input */}
        <input
          className="input rounded-none pt-0 h-[46px]"
          type="number"
          name="number"
          placeholder="Phone Number"
          onChange={(e) => setPhoneNumber(e.target.value)}
        />


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

        {/* Register Button */}
        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
        >
          Register
        </button>
      </form>

      {/* Login Link */}
      <Link to="/login" className="font-inter text-xs font-medium">
        Already a member? Log In
      </Link>
    </section>
  );
};

export default SignUp;
