import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { registerDeviceToken } from '../services/api';
import { queryClient } from '../queryClient';
import toast from 'react-hot-toast';

const DEFAULT_VAPID_KEY =
  "BMdqnxp9Ay-U-XpdLPne6ak1FX4hYcT_CgT-0PaB6mXxbLntdLC1qnEDHwAdm7XHL5i4X5V3CCrJPzYzJoJmqxw";

let currentInstantAudio = null;

export const stopInstantOrderAudio = () => {
  if (currentInstantAudio) {
    currentInstantAudio.pause();
    currentInstantAudio.currentTime = 0;
    currentInstantAudio = null;
  }
};

export const usePushNotifications = (isAuthenticated) => {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  const registerTokenWithBackend = useCallback(async (registration) => {
    if (!messaging) {
      console.warn('Firebase messaging is not initialized.');
      return null;
    }
    setIsRegistering(true);
    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || DEFAULT_VAPID_KEY;

      let swRegistration = registration;
      if (!swRegistration && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.ready;
      }

      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        setToken(currentToken);
        try {
          await registerDeviceToken(currentToken, 'web');
        } catch (backendError) {
          console.error('Failed to register token with backend:', backendError);
        }
        return currentToken;
      }
    } catch (error) {
      console.error('An error occurred while retrieving push token:', error);
      if (error?.name === 'AbortError') {
        console.warn(
          'Push notification registration was aborted. If you are using Brave or a hardened browser, enable "Use Google services for push messaging" in brave://settings/privacy.'
        );
      }
    } finally {
      setIsRegistering(false);
    }
    return null;
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error('Push notifications are not supported by your browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const currentToken = await registerTokenWithBackend(registration);
        if (currentToken) {
          toast.success('Push notifications enabled!');
          return true;
        }
      } else if (permission === 'denied') {
        toast.error('Notification permission was blocked in browser settings.');
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
    return false;
  }, [registerTokenWithBackend]);

  useEffect(() => {
    if (!isAuthenticated || !messaging || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // If permission was already granted by user previously, register token silently
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registerTokenWithBackend(registration);
      }).catch((err) => {
        console.warn('Service worker not ready for push notifications:', err);
      });
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';

      const isCasual = payload.data?.type === 'casual';
      const isInstantOrder = payload.data?.type === 'instant_order';

      if (isInstantOrder) {
        // Refresh vendor orders query automatically
        queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });

        // Play sound for instant order
        if (currentInstantAudio) {
          currentInstantAudio.pause();
        }
        currentInstantAudio = new Audio('/sounds/no-problem-notification-sound.mp3');
        currentInstantAudio.loop = true;
        currentInstantAudio.play().catch((e) => console.error('Audio playback failed:', e));

        toast(
          (t) => (
            <div>
              <strong>{title}</strong>
              <br />
              {body}
              <div className="mt-2 flex gap-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold"
                  onClick={() => {
                    stopInstantOrderAudio();
                    toast.dismiss(t.id);
                    window.location.href = '/vendor/dashboard/orders';
                  }}
                >
                  View Order
                </button>
                <button
                  className="bg-gray-200 text-black px-3 py-1 rounded text-sm"
                  onClick={() => {
                    stopInstantOrderAudio();
                    toast.dismiss(t.id);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          {
            duration: 30000,
            position: 'top-center',
            icon: '🚨',
          }
        );
      } else {
        if (isCasual) {
          const casualAudio = new Audio('/sounds/light-hearted-message-tone.mp3');
          casualAudio.play().catch((e) => console.error('Audio playback failed:', e));
        }

        toast(
          <div>
            <strong>{title}</strong>
            <br />
            {body}
          </div>,
          {
            duration: 6000,
            position: 'top-right',
            icon: '🔔',
          }
        );
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, registerTokenWithBackend]);

  return { token, notificationPermission, requestPushPermission, isRegistering };
};

export default usePushNotifications;
