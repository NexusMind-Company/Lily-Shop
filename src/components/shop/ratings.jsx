import React from 'react'
import { FaStar } from 'react-icons/fa'
const Ratings = () => {
  const [rating, setRating] = React.useState(null)
  const [hover, setHover] = React.useState(null) // Added hover state
  const stars = Array(5).fill(0) // Defined stars array with 5 elements
  const colors = {
    black: "#000000",
  }


  React.useEffect(() => {
    setRating(null); // Ensure the default rating is null
  }, []);
  

  return (
    <div>
       <section className= " relative mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 items-center max-w-4xl mx-auto overflow-hidden font-inter">
        <div className="rounded-2xl border-[1px] border-solid border-black h-16 w-full flex items-center justify-center">
          <h1 className="text-lg md:text-xl font-normal font-poppins px-2 text-center">
            JACOB'S <span className="text-lily">FROSTY</span>
          </h1>
        </div>
        <div>
        <img src='./arrowleft.png' className='w-[22px] h-[22px] left-[25px] absolute top-22' />
        </div>
        
        <div className=" w-full flex flex-row mt-5 justify-between">
          <h3 className='font-poppins font-medium text-[15px] md:text-[20px]'>Rate this shop</h3>
          <h3 className='font-poppins font-medium text-[15px] md:text-[20px] text-[#898585] hover:text-lily'>Post</h3>
        </div>
        <div className='w-full flex flex-col '>
          <div className='flex flex-row  gap-2'>
            <img src='./ellipse.png' alt='profile' className='w-[29px] h-[29px] rounded-full'/>
            <div className='flex-1'>
            <h3 className='font-poppins text-[13px] font-medium '>Justin</h3>
            <p className='font-inter text-[11px] font-medium max-w-[185px] pt-2'>Reviews are public and include your account name.</p>
            </div> 
          </div>
        </div>
        <div className='w-full flex flex-row justify-center'>
          {stars.map((_, index) => {
            return (
              <FaStar
                key={index}
                size={24}
                style={{ marginRight: 10, cursor: "pointer" }}
                color={(index <= (hover || rating) ? colors.black : "#e4e5e9")}
                onClick={() => setRating(index + 1)}
                onMouseEnter={() => setHover(index + 1)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>
        <div className="rounded-md border-[1px] border-solid border-black h-16 w-full flex items-center justify-center mt-7">
          <textarea name="reviews" id="reviews" placeholder='Describe your experience (optional)' className='w-full text-center placeholder:text-[black] font-inter text-[16px] justify-center focus:outline-none'></textarea>
        </div>
        
        </section>
    </div>
  )
}

export default Ratings