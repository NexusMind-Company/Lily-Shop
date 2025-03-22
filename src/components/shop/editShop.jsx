import React from 'react'
import { Link } from 'react-router-dom'

const EditShop = () => {
  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
    {/* Header */}
    <div className="rounded-2xl border border-black h-[70px] w-full flex items-center justify-center">
      <h1 className="text-xl font-normal font-poppins">
        Edit <span className="text-lily">Shop</span>
      </h1>
    </div>

    {/* Shop Title */}
    <div className="flex flex-col items-start justify-start gap-3">
      <h2 className="font-poppins font-bold text-black text-xs md:text-sm lg:text-lg uppercase">
        <span className="border-b-2 border-sun">MY SH</span>OP
        <br />
      </h2>
    </div>
    <div className='w-[145px] h-[301px] flex flex-col gap-3 rounded-[8px] top-32 right-0'>
      <img src="/shop.svg" alt="shop" className="w-[141px] h-[188px]" />
      <div className='border-l-2 border-sun px-2 flex flex-col gap-1'>
        <h1 className='font-poppins font-bold text-[13px] text-[#4eb75e]'> HAYWHY STORE </h1>
        <p className='font-inter font-light text-[10px]'>This is just a placeholder for the description ......</p>
        <h3 className='font-inter font-medium text-[10px]'>1, ABC road , Lagos , NIGERIA.</h3>
        <p
          className="underline  underline-offset-0 cursor-pointer text-[10px]">
          View Prices
        </p>
      </div>
      <div className='flex flex-row gap-2 justify-center mt-3'>
          <Link to="/editform">
            <button className='w-[76px] h-[19px] bg-[#fdad6d] text-[10px] font-inter font-light cursor-pointer'>
                Edit Shop
            </button>
        </Link>
        <button className='w-[55px] h-[19px] bg-[#898585] text-[10px] font-inter font-light cursor-pointer mt-1'>Delete</button>
      </div>
      <div className="flex items-center justify-start mt-10">
          <Link
            to="/createForm"
            className="font-inter font-semibold text-x text-black px-3 md:text-sm flex items-center gap-2 py-2  rounded-lg  transition"
          >
            Create New
            <img
              src="/addition.svg"
              alt="addition-icon"
              className="w-4 md:w-5"
            />
          </Link>
        </div>
    </div>
    </section>
  )
}

export default EditShop
