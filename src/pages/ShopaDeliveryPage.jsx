import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { submitShopaDeliveryRequest } from '../services/api';

const ShopaDeliveryPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    otherNames: '',
    phone: '',
    pickupLocation: '',
    deliveryLocation: '',
    packageDescription: '',
    specialInstructions: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create payload matching the backend format
      const payload = {
        first_name: formData.firstName,
        surname: formData.surname,
        other_names: formData.otherNames,
        phone: formData.phone,
        pickup_location: formData.pickupLocation,
        delivery_location: formData.deliveryLocation,
        package_description: formData.packageDescription,
        special_instructions: formData.specialInstructions
      };

      await submitShopaDeliveryRequest(payload);
      toast.success('Request sent! Shopa will contact you on WhatsApp shortly.');
      
      // Clear form
      setFormData({
        firstName: '',
        surname: '',
        otherNames: '',
        phone: '',
        pickupLocation: '',
        deliveryLocation: '',
        packageDescription: '',
        specialInstructions: ''
      });
      
    } catch (err) {
      toast.error('Failed to send request. Please try again or contact via WhatsApp.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 py-4 flex items-center shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="ml-3 text-lg font-bold text-gray-800">Use Shopa Today</h1>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-darklily via-lily to-darklily text-white py-16 px-6 text-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-lily blur-3xl"></div>
          <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-lily blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20 transform hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img src="/shopa_assets/shopa-logo.jpg" alt="Shopa" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight drop-shadow-md">Deliveries powered by Shopa</h2>
          <p className="text-lily/10 max-w-md mx-auto text-lg leading-relaxed opacity-90">
            We've partnered with Shopa to handle all your logistics. Fast, reliable, and just a WhatsApp message away.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6">How it works</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lily/20 text-darklily font-bold flex items-center justify-center">1</div>
            <div>
              <h4 className="font-semibold text-gray-800">Fill the form</h4>
              <p className="text-sm text-gray-500">Provide your pickup and delivery details below.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lily/20 text-darklily font-bold flex items-center justify-center">2</div>
            <div>
              <h4 className="font-semibold text-gray-800">Shopa contacts you</h4>
              <p className="text-sm text-gray-500">Our rider will reach out to you via WhatsApp immediately.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lily/20 text-darklily font-bold flex items-center justify-center">3</div>
            <div>
              <h4 className="font-semibold text-gray-800">Item gets delivered</h4>
              <p className="text-sm text-gray-500">Track and confirm delivery right from your WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 py-6 bg-white border-y border-gray-100 mt-2">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Request a Delivery</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
              <input
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input w-full"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Surname *</label>
              <input
                required
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="input w-full"
                placeholder="Surname"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Other Names (Optional)</label>
            <input
              name="otherNames"
              value={formData.otherNames}
              onChange={handleChange}
              className="input w-full"
              placeholder="Other Names"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp Number *</label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g. +23490..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pickup Location *</label>
            <textarea
              required
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              rows={2}
              className="input w-full resize-none"
              placeholder="Full address of pickup"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Location *</label>
            <textarea
              required
              name="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={handleChange}
              rows={2}
              className="input w-full resize-none"
              placeholder="Full address of destination"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Package Description (Optional)</label>
            <input
              name="packageDescription"
              value={formData.packageDescription}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g. 2 pairs of shoes, fragile"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Special Instructions (Optional)</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows={2}
              className="input w-full resize-none"
              placeholder="Any specific directions for the rider?"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-lily text-white font-bold py-4 rounded-xl shadow-md hover:bg-darklily hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              'Sending Request...'
            ) : (
              <>
                <span>Send Request</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </section>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/2349073640447" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    </div>
  );
};

export default ShopaDeliveryPage;
