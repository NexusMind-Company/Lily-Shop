import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { registerDeviceToken } from '../services/api';
import { queryClient } from '../queryClient';
import toast from 'react-hot-toast';

const DEFAULT_VAPID_KEY =
  "BMdqnxp9Ay-U-XpdLPne6ak1FX4hYcT_CgT-0PaB6mXxbLntdLC1qnEDHwAdm7XHL5i4X5V3CCrJPzYzJoJmqxw";

let currentInstantAudio = null;
let hasActiveForegroundListener = false;

export const stopInstantOrderAudio = () => {
  if (currentInstantAudio) {
    currentInstantAudio.pause();
    currentInstantAudio.currentTime = 0;
    currentInstantAudio = null;
  }
};

export const usePushNotifications = (isAuthenticated) => {
  const [token, setToken] = useState(
    typeof window !== 'undefined' && window.__fcm_token ? window.__fcm_token : null
  );
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
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        if (!swRegistration) {
          try {
            swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/',
            });
          } catch (registerError) {
            console.warn('Direct SW registration failed, falling back to ready:', registerError);
            swRegistration = await navigator.serviceWorker.ready;
          }
        }
        await navigator.serviceWorker.ready;
      }

      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        setToken(currentToken);
        if (typeof window !== 'undefined') {
          window.__fcm_token = currentToken;
        }
        console.log('✅ FCM Push Token generated:', currentToken);

        if (isAuthenticated) {
          try {
            await registerDeviceToken(currentToken, 'web');
            console.log('✅ Push notification token registered with backend successfully.');
          } catch (backendError) {
            console.error('Failed to register token with backend:', backendError);
          }
        } else {
          console.info('FCM Token ready. Backend registration will occur once authenticated.');
        }

        return currentToken;
      } else {
        console.warn('No registration token available. Request notification permissions first.');
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
  }, [isAuthenticated]);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error('Push notifications are not supported by your browser.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const currentToken = await registerTokenWithBackend();
        if (currentToken) {
          toast.success('Push notifications enabled!');
          return currentToken;
        }
      } else if (permission === 'denied') {
        toast.error('Notification permission was blocked in browser settings.');
        return null;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
    return null;
  }, [registerTokenWithBackend]);

  // Expose convenient test helpers in browser console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.requestPushPermission = requestPushPermission;
      window.getFcmToken = async () => {
        if (Notification.permission !== 'granted') {
          return await requestPushPermission();
        }
        return await registerTokenWithBackend();
      };
    }
  }, [registerTokenWithBackend, requestPushPermission]);

  // If permission was already granted by user previously, retrieve token on mount
  useEffect(() => {
    if (!messaging || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      registerTokenWithBackend();
    }
  }, [registerTokenWithBackend]);

  // Sync token with backend if auth status becomes true and token is already held
  useEffect(() => {
    if (isAuthenticated && token) {
      registerDeviceToken(token, 'web').catch((backendError) => {
        console.error('Failed to sync existing token to backend on auth change:', backendError);
      });
    }
  }, [isAuthenticated, token]);

  // Listen for foreground messages (deduplicated across component instances)
  useEffect(() => {
    if (!messaging || hasActiveForegroundListener) {
      return;
    }

    hasActiveForegroundListener = true;
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
      hasActiveForegroundListener = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { token, notificationPermission, requestPushPermission, isRegistering };
};

export default usePushNotifications;
