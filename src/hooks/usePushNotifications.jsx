import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import { registerDeviceToken } from '../services/api';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is used, otherwise replace with your toast

export const usePushNotifications = (isAuthenticated) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !messaging) return;

    const requestPermissionAndRegister = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Explicitly wait for the service worker registration
          const registration = await navigator.serviceWorker.ready;
          
          // Get the FCM token
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            setToken(currentToken);
            // Send token to the backend
            try {
              await registerDeviceToken(currentToken, 'web');
              console.log('Push notification token registered with backend.');
            } catch (backendError) {
              console.error('Failed to register token with backend:', backendError);
            }
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Notification permission not granted.');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Push notification registration aborted. This is common if notifications are unsupported or blocked.');
        } else {
          console.error('An error occurred while retrieving token:', error);
        }
      }
    };

    requestPermissionAndRegister();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Extract title and body, safely handling different payload structures
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      
      const isInstantOrder = payload.data?.type === 'instant_order';

      if (isInstantOrder) {
        // Play a continuous rigorous ringtone for instant orders
        const audio = new Audio('/sounds/ringtone.wav'); // We'll assume this exists or use a default one
        audio.loop = true;
        audio.play().catch(e => console.error("Audio playback failed:", e));

        // Use a custom toast that allows the user to stop the ringing and view the order
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
                    audio.pause();
                    toast.dismiss(t.id);
                    window.location.href = "/live-kitchen";
                  }}
                >
                  View Order
                </button>
                <button
                  className="bg-gray-200 text-black px-3 py-1 rounded text-sm"
                  onClick={() => {
                    audio.pause();
                    toast.dismiss(t.id);
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ),
          {
            duration: 30000, // Keep it open for 30 seconds
            position: 'top-center',
            icon: '🚨',
          }
        );
      } else {
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
  }, [isAuthenticated]);

  return { token };
};

export default usePushNotifications;
