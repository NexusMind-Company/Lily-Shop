

const lilyChat2 = () => {
  return (
    <div className='h-screen mx-auto bg-[#ecf0f1] relative'>
      <div className='relative'>
          <img src='./blueedge.png' alt='round edge' className='absolute top-0 right-0 w-[100px] h-[100px] md:w-[246px] md:h-[246px] opacity-70 mix-blend-darken backdrop-blur-[17.2px]'/>
      <span className='text-[#90bbb2] font-inter font-bold text-[32px] items-center justify-between flex flex-row p-3 md:p-7' >Lily
        <img src='./arrow.png' alt='arrow' className='z-10'/>
      </span>

      <div className="flex-1p-4 space-y-4 mt-8 mb-15">
        {/* User Message */}
        <div className="flex justify-end px-3">
          <div className="bg-[#90bbb2] text-white p-3 rounded-lg max-w-xs">
            Hi, how can I track my order?
          </div>
        </div>

        {/* Bot Reply */}
        <div className="flex flex-row justify-start items-center">
          <img src='./lily.svg' alt='lily' className='w-10 h-7 rounded-full'/>
          <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
            You can track your order in the "Orders" section of your account.
          </div>
        </div>
        <div className="flex justify-end px-3">
          <div className="bg-[#90bbb2] text-white p-3 rounded-lg max-w-xs">
            Hi, how can I track my order?
          </div>
        </div>

        {/* Bot Reply */}
        <div className="flex flex-row justify-start items-center">
          <img src='./lily.svg' alt='lily' className='w-10 h-7 rounded-full'/>
          <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
            You can track your order in the "Orders" section of your account.
          </div>
        </div>
        <div className="flex justify-end px-3">
          <div className="bg-[#90bbb2] text-white p-3 rounded-lg max-w-xs">
            Hi, how can I track my order?
          </div>
        </div>

        {/* Bot Reply */}
        <div className="flex flex-row justify-start items-center">
          <img src='./lily.svg' alt='lily' className='w-10 h-7 rounded-full'/>
          <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
            You can track your order in the "Orders" section of your account.
          </div>
        </div>
        
      </div>

      <img src='./pinkedge.png' alt='round edge' className='absolute bottom-[50px] left-0 w-[100px] h-[80px] md:w-[246px] md:h-[246px] opacity-70 mix-blend-darken backdrop-blur-[17.2px] z-0'/>

      <label className='flex flex-row items-center justify-between rounded-[20px] p-3 mt-7 shadow-lg w-full max-w-xl md:max-w-xl mx-auto '>
        <img src='./file.png' alt='file icon'/>
        <input type='text' placeholder='Your Message...' className='focus:outline-none text-left flex-grow'/>
        <img src='./mic.png' alt='mic icon'/>
        </label> 
        
      
   
    </div>
  </div>
  )
}

export default lilyChat2

 


