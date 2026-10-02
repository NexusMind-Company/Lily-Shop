import { useEffect, useState, useCallback, useRef } from 'react';
import { getVapidPublicKey, registerDeviceToken } from '../services/api';
import toast from 'react-hot-toast';

let currentInstantAudio = null;
let hasActiveForegroundListener = false;

export const stopInstantOrderAudio = () => {
  if (currentInstantAudio) {
    currentInstantAudio.pause();
    currentInstantAudio.currentTime = 0;
    currentInstantAudio = null;
  }
};

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (isAuthenticated) => {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasAttemptedRef.current = false;
      setToken(null);
    }
  }, [isAuthenticated]);

  const registerTokenWithBackend = useCallback(async () => {
    setIsRegistering(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported.');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Fetch VAPID public key from backend
        const data = await getVapidPublicKey();
        if (!data?.public_key) {
          console.warn('VAPID public key is not configured on the backend.');
          return null;
        }

        const applicationServerKey = urlB64ToUint8Array(data.public_key);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      if (subscription) {
        setToken(subscription.endpoint);

        if (isAuthenticated) {
          try {
            await registerDeviceToken(subscription, 'web');
          } catch (backendError) {
            console.error('Failed to register subscription with backend:', backendError);
          }
        }
        return subscription.endpoint;
      }
    } catch (error) {
      console.error('An error occurred while retrieving push subscription:', error);
    } finally {
      setIsRegistering(false);
    }
    return null;
  }, [isAuthenticated]);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Push notifications are not supported by your browser.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        hasAttemptedRef.current = true;
        return await registerTokenWithBackend();
      } else {
        toast.error('Notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission.');
    }
    return null;
  }, [registerTokenWithBackend]);

  useEffect(() => {
    if (
      isAuthenticated &&
      notificationPermission === 'granted' &&
      !token &&
      !isRegistering &&
      !hasAttemptedRef.current
    ) {
      hasAttemptedRef.current = true;
      registerTokenWithBackend();
    }
  }, [isAuthenticated, notificationPermission, token, isRegistering, registerTokenWithBackend]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleMessage = (event) => {
        const payload = event.data;
        if (payload?.data?.type === "INSTANT_ORDER") {
          // Play ringtone if possible, otherwise rely on vibrate in SW
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  return {
    token,
    isRegistering,
    notificationPermission,
    requestPushPermission,
  };
};

export default usePushNotifications;
