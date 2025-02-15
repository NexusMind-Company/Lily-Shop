const createShop = () => {
  return (
    <section className="mt-[40px] flex flex-col px-7 gap-7 md:items-center md:justify-center">
      <div className="rounded-2xl border border-black h-[70px] w-full flex items-center justify-center">
        <h1 className="text-xl/[30px] font-normal font-poppins">
          Create <span className="text-[#4EB75E]">Shop</span>
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs/[18px] uppercase">
          <span className="border-b-2 border-[#F6AD6D]">Customi</span>ze Shop
          <br />
          <span className="h-2 w-2 bg-red-900"></span>
        </h2>
        <form className="w-full flex flex-col gap-5">
          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="title"
              name="title"
              placeholder=" "
            />
            <label htmlFor="title" className="label">
              Title
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="address"
              name="address"
              placeholder=" "
            />
            <label htmlFor="address" className="label">
              Address
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="number"
              id="phone"
              name="phone"
              placeholder=" "
            />
            <label htmlFor="phone" className="label">
              Phone
            </label>
          </div>

          <div className="flex flex-col">
            <label htmlFor="sDescription" className="">
            Short Description
            </label>
            <textarea
              className="border border-black rounded-lg p-2 h-[74px]"
              type="text"
              id="sDescription"
              name="sDescription"
              placeholder=" "
            />
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              placeholder=" "
            />
            <label htmlFor="name" className="label">
              Name
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="price"
              name="price"
              placeholder=" "
            />
            <label htmlFor="price" className="label">
              Price
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              placeholder=" "
            />
            <label htmlFor="name" className="label">
              Name
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="price"
              name="price"
              placeholder=" "
            />
            <label htmlFor="price" className="label">
              Price
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              placeholder=" "
            />
            <label htmlFor="name" className="label">
              Name
            </label>
          </div>

          <div className="flex flex-col relative">
            <input
              className="input"
              type="text"
              id="price"
              name="price"
              placeholder=" "
            />
            <label htmlFor="price" className="label">
              Price
            </label>
          </div>
        </form>
      </div>
    </section>
  );
};

export default createShop;
