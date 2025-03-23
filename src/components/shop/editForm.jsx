import { useState } from 'react';
import { Link } from 'react-router-dom';

const EditForm = () => {
  const [name, setName] = useState(''); 

  return (
    <section className="mt-10 min-h-screen flex flex-col px-4 md:px-7 gap-5 md:gap-7 max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="rounded-2xl border border-black h-[70px] w-full flex items-center justify-center">
        <h1 className="text-xl font-normal font-poppins">
          Edit <span className="text-lily">Shops</span>
        </h1>
      </div>

      {/* Shop Title */}
      <div className="flex flex-col items-start justify-start gap-3">
        <h2 className="font-poppins font-bold text-black text-xs md:text-sm lg:text-lg uppercase">
          <span className="border-b-2 border-sun">EDIT S</span>HOP
          <br />
        </h2>
      </div>

      <div className="flex flex-col gap-5">
        <label className="block text-sm font-medium"></label>
        <input
          type="text"
          className="w-full p-2 border rounded-[7px] h-[54px]"
          placeholder="Title"
          
        />
        <label className="block text-sm font-medium"></label>
        <input
          type="text"
          className="w-full p-2 border rounded-[7px] h-[54px]"
          placeholder="Address"
        />
        <label className="block text-sm font-medium"></label>
        <input
          type="text"
          className="w-full p-2 border rounded-[7px] h-[54px]"
          placeholder="Phone Number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium font-inter">Short description</label>
        <textarea
          className="w-full p-2 border rounded-[7px] h-[100px] mt-2 resize-none"
          placeholder="Short description"
        ></textarea>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium font-inter">Detailed description</label>
        <textarea
          className="w-full p-2 border rounded-[7px] h-[200px] mt-2 resize-none"
          placeholder="Detailed description"
        ></textarea>
      </div>

      <label className="block text-sm font-medium">Media</label>
      <div className="border-dashed border-2 border-gray-400 p-4 rounded-md mb-4 h-[120px] mt-3">
        <span className="text-gray-500">Display Photo</span>
        <input type="file" className="hidden" id="displayPhoto1" />
        <div className="mt-2 flex items-center justify-center">
          <label
            htmlFor="displayPhoto1"
            className="px-4 py-1 rounded-lg cursor-pointer border-[#898585] border mt-4"
          >
            Upload
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block text-sm font-medium mt-5">
          <h3 className="block text-sm font-medium text-end">Add Photos</h3>
        </label>
        <div className="border-dashed border-2 border-gray-400 p-4 rounded-md mb-4 h-[120px] mt-3">
          <span className="text-gray-500 text-start">Products Photo</span>
          <input type="file" className="hidden" id="displayPhoto2" />
          <div className="mt-2 flex items-center justify-center">
            <label
              htmlFor="displayPhoto2"
              className="px-4 py-1 rounded-lg cursor-pointer border-[#898585] border mt-4"
            >
              Upload
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium"></label>
          <input
            type="text"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Name"
          />
          <label className="block text-sm font-medium"></label>
          <input
            type="number"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Price"
          />
        </div>
        <label className="block text-sm font-medium">
          <div className="border-dashed border-2 border-gray-400 p-4 rounded-md mb-4 h-[120px] mt-3">
            <span className="text-gray-500 text-start">Products Photo</span>
            <input type="file" className="hidden" id="displayPhoto3" />
            <div className="mt-2 flex items-center justify-center">
              <label
                htmlFor="displayPhoto3"
                className="px-4 py-1 rounded-lg cursor-pointer border-[#898585] border mt-4"
              >
                Upload
              </label>
            </div>
          </div>
        </label>
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium"></label>
          <input
            type="text"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Name"
          />
          <label className="block text-sm font-medium"></label>
          <input
            type="number"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Price"
          />
        </div>
        <label className="block text-sm font-medium mt-5">
          <h3 className="block text-sm font-medium text-end">Add Videos</h3>
        </label>
        <div className="border-dashed border-2 border-gray-400 p-4 rounded-md mb-4 h-[120px] mt-3">
          <span className="text-gray-500 text-start">Products Video</span>
          <input type="file" className="hidden" id="displayvideo" />
          <div className="mt-2 flex items-center justify-center">
            <label
              htmlFor="displayvideo"
              className="px-4 py-1 rounded-lg cursor-pointer border-[#898585] border mt-4"
            >
              Upload
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium"></label>
          <input
            type="text"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Name"
          />
          <label className="block text-sm font-medium"></label>
          <input
            type="number"
            className="w-full p-2 border rounded-[7px] h-[54px]"
            placeholder="Price"
          />
        </div>
        <div className="border-dashed border-2 border-gray-400 p-4 rounded-md mb-4 h-[120px] mt-3">
          <span className="text-gray-500 text-start">Documents</span>
          <input type="file" className="hidden" id="documents" />
          <div className="mt-2 flex items-center justify-center">
            <label
              htmlFor="documents"
              className="px-4 py-1 rounded-lg cursor-pointer border-[#898585] border mt-4"
            >
              Upload
            </label>
          </div>
         </div>
         <div className="flex flex-col gap-3 ">
  <label htmlFor="category" className="block text-md font-medium">
    Category
  </label>
      <select className='w-full p-2 border rounded-[7px] h-[54px]' id="category">
    <option value="">Select a category</option>
    <option value="option1">option1</option>
    <option value="option2">option2</option>
    <option value="option3">option3</option>
    <option value="option4">option4</option>
    <option value="option5">option5</option>
    </select>
  </div>
  </div>
  <div className="flex items-center justify-evenly bg-orange-300 p-10 mt-5 font-inter font-medium text-xs/[13.31px] ">
          <button
            type="button"
            className="bg-ash text-white py-2 w-[105px] cursor-pointer"
          >
            <Link to="">Discard</Link>
          </button>
          <button
            type="submit"
            className="bg-white text-black py-2 w-[105px] hover:bg-lily hover:text-white cursor-pointer"
          >
            Save & Deploy
          </button>
        </div>
  </section>
  );
};

export default EditForm;
