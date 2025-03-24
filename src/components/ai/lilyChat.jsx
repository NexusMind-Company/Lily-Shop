import React from 'react'
import{ useState } from 'react'
import { Paperclip, Mic } from 'lucide-react'

const lilyChat = () => {
  return (
    <div className='h-screen mx-auto bg-[#ecf0f1] relative'>
        <div className='relative'>
          <img src='./blueedge.png' alt='round edge' className='absolute top-0 right-0 w-[100px] h-[100px] md:w-[246px] md:h-[246px] opacity-70 mix-blend-darken backdrop-blur-[17.2px]'/>
      <span className='text-[#90bbb2] font-inter font-bold text-[32px] items-center justify-between flex flex-row p-3 md:p-7' >Lily
        <img src='./arrow.png' alt='arrow' className='z-10'/>
      </span>
    
        <img src='./menu.png' alt='menu' className='md:hidden w-[48px] h-[48px] pl-2'/>
      </div>
      <div className=' mt-32 p-3 md:p-7'>
        <h1 className='font-inter text-[18px] font-normal mx-auto text-center pb-5'>Hello, How May I Help You Today?</h1>
       <label className='flex flex-row items-center justify-between rounded-[20px] p-3 mt-7 shadow-lg w-full max-w-xl md:max-w-xl mx-auto'>
        <img src='./file.png'/>
        <input type='text' placeholder='Your Message...' className='focus:outline-none text-left flex-grow'/>
        <img src='./mic.png'/>
       </label>
      </div>
      
      <img src='./pinkedge.png' alt='round edge' className='absolute bottom-0 left-0 w-[100px] h-[100px] md:w-[246px] md:h-[246px] opacity-70 mix-blend-darken backdrop-blur-[17.2px] '/>
      
    </div>
  )
}

export default lilyChat