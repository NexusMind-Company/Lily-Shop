importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBp2ji3oEXR1nzCP0_1Vu3OShnxtxY4_oU",
  authDomain: "lily-shops.firebaseapp.com",
  projectId: "lily-shops",
  storageBucket: "lily-shops.firebasestorage.app",
  messagingSenderId: "571901199347",
  appId: "1:571901199347:web:4f8654f22628c2386c8886",
  measurementId: "G-K6982NE8EB"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/logo.png', // Fallback icon, ensure you have a logo.png in public/
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
