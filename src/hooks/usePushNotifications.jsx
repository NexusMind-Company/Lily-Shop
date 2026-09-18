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
          // Get the FCM token
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
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
        console.error('An error occurred while retrieving token:', error);
      }
    };

    requestPermissionAndRegister();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Extract title and body, safely handling different payload structures
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';

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
