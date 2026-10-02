import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePayment } from './usePayment';

export const useCustomerLocation = () => {
  const { paymentData } = usePayment();
  const selectedAddress = paymentData?.selectedAddress;

  const { user_data } = useSelector((state) => state.auth || {});

  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // 'address', 'browser', 'none'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check selected address
    if (selectedAddress?.latitude && selectedAddress?.longitude) {
      setUserLat(selectedAddress.latitude);
      setUserLon(selectedAddress.longitude);
      setLocationSource('address');
      setIsLoading(false);
      return;
    }
    if (selectedAddress?.lat && selectedAddress?.lon) {
      setUserLat(selectedAddress.lat);
      setUserLon(selectedAddress.lon);
      setLocationSource('address');
      setIsLoading(false);
      return;
    }

    // 2. Fallback to browser GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLon(position.coords.longitude);
          setLocationSource('browser');
          setIsLoading(false);
        },
        (error) => {
          console.warn("Geolocation error or denied:", error);
          setLocationSource('none');
          setIsLoading(false);
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setLocationSource('none');
      setIsLoading(false);
    }
  }, [selectedAddress]);

  return { userLat, userLon, locationSource, isLoading };
};
