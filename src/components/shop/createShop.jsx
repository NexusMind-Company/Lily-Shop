import { Link } from "react-router";

const createShop = () => {
  return (
    <section className="mt-10 flex flex-col gap-7 px-7 min-h-screen">
      <div className="rounded-2xl border border-black h-[70px] md:w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Create <span className="text-lily">Shop</span>
        </h1>
      </div>

      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs/[18px] uppercase">
          <span className="border-b-2 border-sun">My sh</span>op
          <br />
        </h2>
      </div>

      <div>
        <p className="font-inter text-base font-normal">
          Empty space, endless possibilities—create your shop now
        </p>
      </div>

      <div>
        <Link to="/createForm" className="font-inter font-semibold text-xs flex items-center gap-1">
          Create New
          <img src="/addition.svg" alt="addition-icon" />
        </Link>
      </div>
    </section>
  );
};

export default createShop;
