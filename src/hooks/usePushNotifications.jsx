import { useEffect, useState, useCallback, useRef } from 'react';
import { getVapidPublicKey, registerDeviceToken } from '../services/api';
import toast from 'react-hot-toast';

let currentInstantAudio = null;

export const stopInstantOrderAudio = () => {
  if (currentInstantAudio) {
    currentInstantAudio.pause();
    currentInstantAudio.currentTime = 0;
    currentInstantAudio = null;
  }
};

function urlB64ToUint8Array(base64String) {
  if (!base64String || typeof base64String !== 'string') return null;

  const cleanStr = base64String.trim().replace(/^["']|["']$/g, '');
  if (!/^[A-Za-z0-9\-_=]+$/.test(cleanStr)) {
    return null;
  }

  const padding = '='.repeat((4 - (cleanStr.length % 4)) % 4);
  const base64 = (cleanStr + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.warn('Failed to parse base64 VAPID key in urlB64ToUint8Array:', error);
    return null;
  }
}

const areKeysEqual = (key1, key2) => {
  if (!key1 || !key2) return false;
  const a = key1 instanceof Uint8Array ? key1 : new Uint8Array(key1);
  const b = key2 instanceof Uint8Array ? key2 : new Uint8Array(key2);
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

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

      // 1. Fetch expected VAPID public key from backend
      let rawPublicKey = null;
      try {
        const data = await getVapidPublicKey();
        rawPublicKey = data?.public_key;
      } catch (fetchError) {
        console.warn('Failed to fetch VAPID key from backend:', fetchError);
      }

      // If backend returned invalid key or filename like "public_key.pem", use env fallback
      const isInvalidKey =
        !rawPublicKey ||
        typeof rawPublicKey !== 'string' ||
        rawPublicKey.includes('.pem') ||
        rawPublicKey.includes('BEGIN') ||
        !/^[A-Za-z0-9\-_=]+$/.test(rawPublicKey.trim());

      if (isInvalidKey) {
        rawPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || null;
      }

      const applicationServerKey = urlB64ToUint8Array(rawPublicKey);
      if (!applicationServerKey) {
        console.warn(
          'Push notification setup skipped: Valid VAPID public key not available (received:',
          rawPublicKey,
          ')'
        );
        return null;
      }

      let subscription = await registration.pushManager.getSubscription();

      // 2. If subscription exists, verify whether its applicationServerKey matches current backend VAPID key
      if (subscription) {
        const existingKey = subscription.options?.applicationServerKey;
        const hasKeyMismatch = !existingKey || !areKeysEqual(existingKey, applicationServerKey);
        if (hasKeyMismatch) {
          console.info('VAPID public key changed or mismatched. Unsubscribing old push subscription...');
          try {
            await subscription.unsubscribe();
          } catch (unsubError) {
            console.warn('Failed to unsubscribe old push subscription:', unsubError);
          }
          subscription = null;
        }
      }

      // 3. Subscribe if no active or matching subscription exists
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      if (subscription) {
        setToken(subscription.endpoint);

        if (isAuthenticated) {
          try {
            const subPayload = subscription.toJSON ? subscription.toJSON() : subscription;
            await registerDeviceToken(subPayload, 'web');
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
