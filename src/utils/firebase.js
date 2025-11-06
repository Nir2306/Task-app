// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Uses environment variables for security (with fallback for development)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCV5ocypqM29YWAHiEMhdSSLPQhAnWdMdc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "taskapp-477218.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "taskapp-477218",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "taskapp-477218.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "708029154097",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:708029154097:web:237ee8dbc209813fa32610",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6KWD86238F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser, not in SSR)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;

