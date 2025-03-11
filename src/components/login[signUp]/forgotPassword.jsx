import { Link } from "react-router";

const forgotPassword = () => {
  return (
    <section className="mt-10 flex flex-col gap-20 px-7 min-h-screen max-w-3xl mx-auto">
      <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Forgot <span className="text-lily">Password</span>
        </h1>
      </div>

      <form className="flex flex-col">
        <label className="text-center font-poppins text-[16px] pb-4 font-medium" htmlFor="email">Enter Email Address</label>
        <input name="email" id="email" className="input pt-0" type="text"></input>
        <Link className="text-center text-sm font-medium font-inter text-ash pt-2 pb-10" to="/login">Back to Sign in</Link>
        <button
          className="input pt-0 h-[46px] bg-sun border-none rounded-[3px] font-inter font-bold text-[15px]/[18.51px]"
          type="submit"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default forgotPassword;
