import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Package, ShoppingBag, Bike, MapPin, Phone, Loader2, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDeliveryAddresses, 
  shopaCalculateFee, 
  shopaCreateDelivery 
} from '../services/api';

const ShopaDeliveryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('parcel');
  
  // Parcel Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    phone: '',
    pickupLocation: '',
    dropoffLocation: '',
    packageDescription: '',
    specialInstructions: ''
  });
  
  const [feeData, setFeeData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);

  const { data: addressesResponse, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["deliveryAddresses"],
    queryFn: fetchDeliveryAddresses,
  });

  const addresses = Array.isArray(addressesResponse) ? addressesResponse : addressesResponse?.results || [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFeeData(null);
    setPaymentStep(false);
  };

  const handleCalculateFee = async () => {
    if (!formData.pickupLocation || !formData.dropoffLocation) {
        toast.error("Please select pickup and dropoff locations");
        return;
    }
    if (formData.pickupLocation === formData.dropoffLocation) {
        toast.error("Pickup and dropoff locations cannot be the same");
        return;
    }
    
    const pickupAddr = addresses?.find(a => a.id.toString() === formData.pickupLocation);
    const dropoffAddr = addresses?.find(a => a.id.toString() === formData.dropoffLocation);
    
    if (!pickupAddr?.latitude || !dropoffAddr?.latitude) {
        toast.error("Selected addresses must have GPS coordinates. Please add a new address.");
        return;
    }
    
    setIsCalculating(true);
    try {
        const payload = {
            pickup_lat: pickupAddr.latitude,
            pickup_lon: pickupAddr.longitude,
            dropoff_lat: dropoffAddr.latitude,
            dropoff_lon: dropoffAddr.longitude
        };
        const result = await shopaCalculateFee(payload);
        setFeeData(result);
        setPaymentStep(true);
    } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to calculate fee.");
        console.error(err);
    } finally {
        setIsCalculating(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!formData.firstName || !formData.surname || !formData.phone) {
        toast.error("Please fill in recipient details.");
        return;
    }
    setIsSubmitting(true);
    try {
        const pickupAddr = addresses?.find(a => a.id.toString() === formData.pickupLocation);
        const dropoffAddr = addresses?.find(a => a.id.toString() === formData.dropoffLocation);
        
        const payload = {
            pickup_lat: pickupAddr.latitude,
            pickup_lon: pickupAddr.longitude,
            dropoff_lat: dropoffAddr.latitude,
            dropoff_lon: dropoffAddr.longitude,
            pickup_address_text: `${pickupAddr.street_address}, ${pickupAddr.city}`,
            dropoff_address_text: `${dropoffAddr.street_address}, ${dropoffAddr.city}`,
            recipient_name: `${formData.firstName} ${formData.surname}`,
            recipient_phone: formData.phone,
            package_description: formData.packageDescription,
            special_instructions: formData.specialInstructions
        };
        
        const res = await shopaCreateDelivery(payload);
        toast.success("Delivery created successfully!");
        // Future Integration: Trigger Paystack Inline here with res.id and res.fee_kobo
        // For now, redirect to a success or wallet page.
        navigate("/orders");
        
    } catch (err) {
        toast.error("Failed to create delivery request.");
        console.error(err);
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatCurrency = (kobo) => {
      return `₦${(kobo / 100).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-display">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="ml-3 text-lg font-bold text-gray-900">Shopa Logistics</h1>
      </header>

      {/* Hero Section */}
      <section className="bg-lily text-white py-12 px-6 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md overflow-hidden">
          <img src="/shopa_assets/shopa-logo.jpg" alt="Shopa" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-3xl font-black mb-3">Deliveries Powered by Shopa</h2>
        <p className="text-white/90 max-w-md mx-auto text-sm font-medium">
          Fast, reliable, and affordable logistics for your everyday needs.
        </p>
      </section>

      {/* Tabs */}
      <div className="sticky top-[68px] z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="flex overflow-x-auto hide-scrollbar">
            <button 
                onClick={() => setActiveTab('parcel')}
                className={`flex-1 min-w-[120px] py-4 text-sm font-bold flex flex-col items-center gap-2 border-b-4 transition-colors ${activeTab === 'parcel' ? 'border-lily text-lily bg-lily/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <Package className="w-5 h-5" />
                Send Parcel
            </button>
            <button 
                onClick={() => setActiveTab('shop')}
                className={`flex-1 min-w-[120px] py-4 text-sm font-bold flex flex-col items-center gap-2 border-b-4 transition-colors ${activeTab === 'shop' ? 'border-lily text-lily bg-lily/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <ShoppingBag className="w-5 h-5" />
                Shop Delivery
            </button>
            <button 
                onClick={() => setActiveTab('errands')}
                className={`flex-1 min-w-[120px] py-4 text-sm font-bold flex flex-col items-center gap-2 border-b-4 transition-colors ${activeTab === 'errands' ? 'border-lily text-lily bg-lily/5' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <Bike className="w-5 h-5" />
                Errands
            </button>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
          {/* Tab 1: Parcel */}
          {activeTab === 'parcel' && (
              <div className="space-y-6 animate-fadeIn">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Send a Parcel</h3>
                      
                      <div className="space-y-5">
                          {/* Location Selection */}
                          <div className="space-y-4 relative">
                              <div className="absolute left-[15px] top-[30px] bottom-[30px] w-0.5 bg-gray-200 z-0"></div>
                              
                              <div className="relative z-10">
                                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-9 uppercase tracking-wider">Pickup Location</label>
                                  <div className="flex gap-3 items-center">
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                      </div>
                                      <div className="flex-1">
                                          <select 
                                            name="pickupLocation"
                                            value={formData.pickupLocation}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-lily focus:border-lily block p-3 font-medium outline-none"
                                          >
                                              <option value="">Select pickup address...</option>
                                              {addresses?.map(addr => (
                                                  <option key={addr.id} value={addr.id}>{addr.street_address}, {addr.city}</option>
                                              ))}
                                          </select>
                                      </div>
                                  </div>
                              </div>

                              <div className="relative z-10">
                                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-9 uppercase tracking-wider">Dropoff Location</label>
                                  <div className="flex gap-3 items-center">
                                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                          <MapPin className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="flex-1">
                                          <select 
                                            name="dropoffLocation"
                                            value={formData.dropoffLocation}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-lily focus:border-lily block p-3 font-medium outline-none"
                                          >
                                              <option value="">Select dropoff address...</option>
                                              {addresses?.map(addr => (
                                                  <option key={addr.id} value={addr.id}>{addr.street_address}, {addr.city}</option>
                                              ))}
                                          </select>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <button 
                            onClick={() => navigate('/add-address')}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-lily font-bold flex items-center justify-center gap-2 hover:bg-lily/5 transition-colors"
                          >
                              <Plus className="w-5 h-5" />
                              Add New Address
                          </button>

                          {!paymentStep ? (
                              <button
                                onClick={handleCalculateFee}
                                disabled={isCalculating}
                                className="w-full mt-4 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                              >
                                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Calculate Fee'}
                              </button>
                          ) : (
                              <div className="mt-8 space-y-5 animate-fadeIn">
                                  <div className="bg-lily/10 border border-lily/20 rounded-2xl p-5">
                                      <h4 className="text-lily font-bold mb-4 flex items-center gap-2">
                                          <CheckCircle className="w-5 h-5" /> Delivery Details Confirmed
                                      </h4>
                                      <div className="flex justify-between items-center border-b border-lily/10 pb-3 mb-3">
                                          <span className="text-gray-600 font-medium">Distance</span>
                                          <span className="font-bold text-gray-900">{feeData?.distance_km} km</span>
                                      </div>
                                      <div className="flex justify-between items-center text-lg">
                                          <span className="text-gray-900 font-bold">Total Fee</span>
                                          <span className="font-black text-lily">{formatCurrency(feeData?.total_fee_kobo)}</span>
                                      </div>
                                  </div>

                                  <div className="space-y-4">
                                      <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Recipient Information</h4>
                                      <div className="grid grid-cols-2 gap-4">
                                          <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-lily" />
                                          <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-lily" />
                                      </div>
                                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="WhatsApp Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-lily" />
                                      <input name="packageDescription" value={formData.packageDescription} onChange={handleChange} placeholder="Package Description (e.g., 2 Shoes)" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-lily" />
                                      <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleChange} placeholder="Special Instructions" rows="2" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-lily resize-none"></textarea>
                                  </div>

                                  <button
                                    onClick={handleSubmitRequest}
                                    disabled={isSubmitting}
                                    className="w-full bg-lily text-white font-bold py-4 rounded-xl shadow-lg shadow-lily/30 hover:brightness-105 transition flex items-center justify-center gap-2 disabled:opacity-70"
                                  >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <><span>Proceed to Payment</span> <ArrowLeft className="w-5 h-5 rotate-180" /></>
                                    )}
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {/* Tab 2: Shop Delivery */}
          {activeTab === 'shop' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-lily/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingBag className="w-10 h-10 text-lily" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Official Logistics Partner</h3>
                  <p className="text-gray-600 leading-relaxed mb-8">
                      Shopa is fully integrated into LilyShops! When you order food or physical items, Shopa handles the delivery automatically. Just select "Delivery" during checkout and your items will be brought straight to your doorstep safely and securely.
                  </p>
                  <button onClick={() => navigate('/')} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-colors">
                      Start Shopping
                  </button>
              </div>
          )}

          {/* Tab 3: Errands */}
          {activeTab === 'errands' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-lily/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Bike className="w-10 h-10 text-lily" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Send us on an errand</h3>
                  <p className="text-gray-600 leading-relaxed mb-8">
                      Need groceries from the market? Medicine from the pharmacy? Or just want someone to pick up a package for you? Send Shopa on an errand! We'll handle the logistics while you relax.
                  </p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                      <h4 className="font-bold text-gray-900 mb-2">How it works:</h4>
                      <ol className="text-left space-y-3 text-sm text-gray-600 mb-6 max-w-sm mx-auto list-decimal list-inside">
                          <li>Message us on WhatsApp.</li>
                          <li>Tell us what you need and where to get it.</li>
                          <li>We'll buy it, deliver it, and you pay us!</li>
                      </ol>
                  </div>

                  <a 
                    href="https://wa.me/2349033325971" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:brightness-105 transition-all"
                  >
                      <Phone className="w-6 h-6" />
                      Chat with Shopa (09033325971)
                  </a>
              </div>
          )}
      </div>

    </div>
  );
};

export default ShopaDeliveryPage;

