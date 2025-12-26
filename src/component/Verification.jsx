
import React, { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Scan } from 'lucide-react';
import {  AlertCircle } from 'lucide-react';
import {  Shield, Eye, CheckCircle,Upload } from 'lucide-react';
import card from "../assets/product.jpg"
import {  Lock } from 'lucide-react';
import { IoLockClosed, IoShield } from 'react-icons/io5';
import { BiSolidShow } from 'react-icons/bi';
import { MdVerified } from 'react-icons/md';

const Verification = () => {
    
  const [completedSteps, setCompletedSteps] = useState(2);
  const totalSteps = 2;
  const progressPercentage = (completedSteps / totalSteps) * 100;

// second steps
 const [formData, setFormData] = useState({
    fullName: '',
    fullAddress: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Add your submit logic here
  };

  const isFormValid = formData.fullName.trim() && formData.fullAddress.trim();

// third steps
  const handleStartVerification = () => {
    console.log('Starting face verification...');
    // Add your face verification logic here
  };


  //step four 
    const [file, setFile] = useState(null);
  
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    };
  
    const handleUploadClick = () => {
      document.getElementById('fileInput').click();
    };
  // steps four

const [currentStep, setCurrentStep] = useState(1);
const [step1Completed, setStep1Completed] = useState(false);
const [step2Completed, setStep2Completed] = useState(false);
const [step3Completed, setStep3Completed] = useState(false);



  return (
    <div className="min-h-screen    mt-6 p-4">
            <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">

          
          <button className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl text-lg font-medium">
            Get <span className="text-[#4caf50]">Verified</span>
          </button>
        </div>
          <button className="mb-6 text-gray-700 hover:text-gray-900">
            <ArrowLeft className='w-8 h-8' />
          </button>
        {/* Content */}
        <div className="bg-white rounded-3xl p-6 ">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Step 1 : Meet Basic Requirements
          </h2>

          {/* Checklist */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#4caf50] rounded-md flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-gray-700 font-medium">
                Add shop name & profile image
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#4caf50] rounded-md flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-gray-700 font-medium">
                Add contact info
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4caf50] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mb-6">
            <span className="font-semibold">{completedSteps} of {totalSteps}</span> completed
          </p>

          {/* Continue Button */}
          <button className="w-full py-4 bg-[#4caf50] hover:bg-[#58ce5c]  text-white font-semibold rounded-full transition-colors">
            Continue
          </button>
        </div>
      </div>
            {/* seccond steps */}
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">

          
          <button className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-2xl text-lg font-medium">
            Get <span className="text-[#4caf50]">Verified</span>
          </button>
        </div>

          <button className="mb-6 text-gray-700 hover:text-gray-900">
            <ArrowLeft className='w-8 h-8' />
          </button>
        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Step 2 : Verify Your Personal Information
          </h2>

          {/* Full Name Field */}
          <form action="">
          <div className='mb-5'>
        
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none  transition-colors"
              placeholder=""
            />
          </div>

          {/* Full Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full Address (Same as ID Card) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none  transition-colors"
              placeholder=""
            />
          </div>

          {/* Continue Button */}
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-4 font-semibold rounded-full transition-colors mt-8 ${
              isFormValid 
                ? 'bg-[#4caf50] hover:bg-[#58ce5c]  text-white' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </button>
          </form>
        </div>
      </div>
            {/* steps three */}
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <button className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-2xl text-lg font-medium">
            Get <span className="text-[#4caf50]  ">Verified</span>
          </button>
        </div>
                  <button className="mb-6 text-gray-700 hover:text-gray-900">
            <ArrowLeft className='w-8 h-8' />
          </button>

        {/* Content */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-gray-900">
            Step 3 : Face ID Verification
          </h2>

          {/* Face Verification Card */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Scan size={40} className="text-gray-900" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                Face Verification
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Verify your identity by uploading a picture on our platform
              </p>
            </div>
          </div>

          {/* Start Verification Button */}
          <button 
            onClick={handleStartVerification}
            className="w-full py-4 bg-[#4caf50] hover:bg-[#58ce5c]  text-white font-semibold rounded-full transition-colors"
          >
            Start Face Verification
          </button>
        </div>
      </div>
            {/* steps three */}
<div className="max-w-lg mx-auto  p-6">
  {/* Header */}
  <div className="mb-8">
    <button className="mb-6 text-gray-700 hover:text-gray-900">
      <ArrowLeft className='w-8 h-8' />
    </button>
  </div>

  {/* Title */}
  <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
    Position your face within the frame
  </h2>

  {/* Camera Frame */}
  <div className="flex-1 flex items-center justify-center mb-8">
    <div className="relative w-80 h-80">
      {/* Outer border - green when current step is completed, orange when active */}
      <div className={`absolute inset-0 rounded-full border-4 ${
        (currentStep === 1 && step1Completed) || 
        (currentStep === 2 && step2Completed) || 
        (currentStep === 3 && step3Completed)
          ? 'border-[#4caf50]' 
          : 'border-orange-300'
      }`}></div>
      {/* Camera view / Black circle */}
      <div className="absolute inset-2 rounded-full bg-black"></div>
    </div>
  </div>

  {/* Step Indicator */}
  <div className="flex items-center justify-center gap-2 mb-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
      step1Completed ? 'bg-[#4caf50] text-white' : 
      currentStep === 1 ? 'bg-orange-400 text-white' : 
      'bg-gray-300 text-gray-600'
    }`}>
      1
    </div>
    <div className="w-8 h-0.5 bg-gray-300"></div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
      step2Completed ? 'bg-[#4caf50] text-white' :
      currentStep === 2 ? 'bg-orange-400 text-white' : 
      'bg-gray-300 text-gray-600'
    }`}>
      2
    </div>
    <div className="w-8 h-0.5 bg-gray-300"></div>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
      step3Completed ? 'bg-[#4caf50] text-white' :
      currentStep === 3 ? 'bg-orange-400 text-white' : 
      'bg-gray-300 text-gray-600'
    }`}>
      3
    </div>
  </div>

  {/* Instruction Text */}
  <p className="text-center text-gray-700 font-medium mb-6">
    Kindly turn your head to the left
  </p>

  {/* Alert Box */}
  <div className="bg-orange-100 border-l-4 border-orange-400 p-4 rounded-lg flex items-start gap-3">
    <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
    <p className="text-sm text-orange-800">
      Make sure you are in a place with enough light to take a clear photo.
    </p>
  </div>



 {/* steps five */}
 
     <div className="min-h-screen p-6">
       <div className="max-w-md mx-auto">
         {/* Header Button */}
        <div className="mb-8">

          
          <button className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-2xl text-lg font-medium">
            Get <span className="text-[#4caf50]">Verified</span>
          </button>
        </div>

          <button className="mb-6 text-gray-700 hover:text-gray-900">
            <ArrowLeft className='w-8 h-8' />
          </button>
 
         {/* Title */}
         <h2 className="text-xl font-bold text-gray-900 mb-8">
           Step 5 : Get Verification Badge
         </h2>
 
         {/* Benefits List */}
         <div className="space-y-6 mb-8">
           {/* Benefit 1 */}
           <div className="flex items-start gap-4">
             <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
               <IoShield className='text-[#4caf50] size-4'/>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 mb-1">
                 More Trust from CustomersBadge
               </h3>
               <p className="text-sm text-gray-600">
                 Build instant credibility with shoppers
               </p>
             </div>
           </div>
 
           {/* Benefit 2 */}
           <div className="flex items-start gap-4">
             <div className="w-12 h-12  flex items-center justify-center flex-shrink-0">
               <BiSolidShow className='text-[#4caf50] size-4'/>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 mb-1">
                 Priority Appearance in Lily Shops Recommendations
               </h3>
               <p className="text-sm text-gray-600">
                 Stand out in search and featured listings
               </p>
             </div>
           </div>
 
           {/* Benefit 3 */}
           <div className="flex items-start gap-4">
             <div className="w-12 h-12  flex items-center justify-center ">
               <MdVerified className='text-[#4caf50] size-4'/>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 mb-1">
                 Verified Badge on Your Shop
               </h3>
               <p className="text-sm text-gray-600">
                 Get the official green tick of authenticity.
               </p>
             </div>
           </div>
         </div>
 
         {/* Pricing */}
         <p className="text-center text-gray-700 mb-4">
           Limited time offer : ₦ 10,000/month
         </p>
 
         {/* Subscribe Button */}
         <button className="w-full bg-[#4caf50] hover:bg-[#58ce5c]  text-white font-semibold py-4 px-6 rounded-full mb-4 transition-colors">
           Subscribe
         </button>
 
         {/* Terms Text */}
         <p className="text-xs text-gray-600 text-center leading-relaxed">
           By subscribing to <span className="font-semibold">Lily Shop Verification</span>, you agree to a recurring payment of ₦10,000/month. This fee helps maintain verification, visibility benefits, and badge status. You can cancel anytime from your account settings. Canceling will remove your verified status and associated benefits.
         </p>
       </div>
     </div>
    </div>
        <div className=" p-6">
      <div className="max-w-md mx-auto">
        {/* Get Verified Button */}
          <button className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-2xl text-lg font-medium">
            Get <span className="text-[#4caf50]">Verified</span>
          </button>

        {/* Back Arrow */}
          <button className="mb-6 text-gray-700 mt-6 hover:text-gray-900">
            <ArrowLeft className='w-8 h-8' />
          </button>

        {/* Step Title */}
        <h1 className="text-xl font-bold mb-2">Step 4: Upload Documents</h1>
        <p className="text-gray-500 text-sm mb-6">
          Government Issued ID (e.g., passport, national ID, or driver's Lincense
        </p>

        {/* ID Card Preview */}
        <img src={card} className='w-full h-60 rounded-2xl' alt="" />
        {/* <div className="bg-gradient-to-br from-cyan-300 to-blue-400 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="text-blue-800 font-bold text-xs">DRIVING LICENSE</div>
            <div className="w-8 h-8 bg-white/30 rounded-full"></div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-24 h-28 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="w-16 h-20 bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="flex-1 text-xs">
              <div className="font-bold mb-1">IDs 012 345 678</div>
              <div className="text-blue-900 font-semibold mb-2">CLASS C</div>
              <div className="mb-1">NAME SURNAME</div>
              <div className="text-gray-700">Address</div>
              <div className="text-gray-700">123 ANYWH-e STREET</div>
              <div className="text-gray-700">CITY, 12345-000</div>
              <div className="mt-2 text-gray-700">Date of birth</div>
              <div className="text-gray-700">02/02/1985</div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-xs text-gray-700">
            <span>⚥ M</span>
            <span>Eyes BLK</span>
            <span>HT 6-00</span>
          </div>
        </div> */}


        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 mb-6 text-sm">
          <ol className="space-y-2 list-decimal list-inside">
            <li>Make sure your ID card is clear enough and no parts are cut off</li>
            <li>Ensure it is a Government Issued ID, failure to do so will result in an automatic denial of your verification request.</li>
            <li>Make sure it is not expired</li>
          </ol>
        </div>

        {/* Upload Button */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center bg-white">
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <button
            onClick={handleUploadClick}
            className="border border-gray-400 text-gray-600 px-6 py-1 rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload ID
          </button>
          {file && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              ✓ {file.name}
            </p>
          )}
        </div>

        {/* Continue Button */}
        <button
          className={`w-full py-4 rounded-full text-white font-medium text-lg transition-all ${
            file
              ? 'bg-[#4caf50] hover:bg-[#58ce5c] '
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!file}
        >
          Continue
        </button>
      </div>
    </div>

    {/* successful page */}

        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-sm w-full bg-white p-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#4caf50] flex items-center justify-center">
                <Check className="w-16 h-16 text-[#4caf50] stroke-[3]" />
              </div>
            </div>
    
            {/* Success Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Payment Successful
            </h1>
    
            {/* Payment Details */}
            <p className="text-gray-600 text-sm mb-8">
              You have made a payment of <span className="font-semibold">₦10,000</span> to{' '}
              <span className="font-semibold">LILY SHOPS</span>
            </p>
    
            {/* Secured by Paystack */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <IoLockClosed className="w-4 h-4 text-black" />
              <span>Secured by <span className=" text-black font-bold ">paystack</span></span>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Verification
