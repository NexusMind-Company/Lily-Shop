import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBp2ji3oEXR1nzCP0_1Vu3OShnxtxY4_oU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lily-shops.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lily-shops",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lily-shops.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "571901199347",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:571901199347:web:4f8654f22628c2386c8886",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-K6982NE8EB",
};

const app = initializeApp(firebaseConfig);

let messagingInstance = null;
if (typeof window !== "undefined") {
  try {
    messagingInstance = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging initialization skipped or unsupported:", error);
  }
}

export const messaging = messagingInstance;
