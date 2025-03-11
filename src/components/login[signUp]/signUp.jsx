import { useState } from "react";
import { Link } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../../store/authSlice';

const editNumber = (num) => {
  const split = num.toString().split('')
  split.shift(); split.unshift('+234')
  const newNum = split.join('');

  return newNum;

}

const SignUp = () => {
  const URL = 'https://running-arlie-nexusmind-b9a0fcb2.koyeb.app/auth/users'

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState([]);

  //User fields input
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('')
  const [username, setUsername] = useState('')
  const [sucessLoginMsg, setSucessLoginMsg] = useState(false)

  const isAuth = useSelector((state) => state.auth)
  const dispatch = useDispatch();

  //handleSubmit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !phoneNumber || !password) {
      setError('All input fields must be filled')
      return;
    }

    console.log(username, phoneNumber, password)
    handleSubmitAsync(username, editNumber(phoneNumber), password);

  }

  const handleSubmitAsync = async (user, phone, pass) => {
    setError([]);
    setSucessLoginMsg(false)


    try {
      const request = await axios.post(URL, { username: user, phone_number: phone, password: pass })
      const response = request.data
      if (response.username) {
        setSucessLoginMsg(true)
        localStorage.setItem('username', response.username)

      }

    } catch (err) {
      if (err.status == 400) {
        // setError(err.response.data.phone_number[0])
        const error = err.response.data
        // setError()
        console.log(error)
      } else {
        console.log(err)
      }
    }
  }
  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen max-w-3xl mx-auto">
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
        <p className="text-red-500 font-bold">{error}</p>
        {sucessLoginMsg && <p className="text-green-500"><span className="font-bold">{username}</span> You've successfully created an account </p>}

        <button
          type="submit"
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
        >
          Register
        </button>
      </form>

      {/* Login Link */}
      <Link to="/login" className="font-inter text-xs font-medium">
        Already a member? <span className="text-lily font-semibold">Log In</span>
      </Link>
    </section>
  );
};

export default SignUp;
