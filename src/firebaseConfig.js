// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCJ-6jUgWyDBxs84JdFmALHwErJ0fDH95M",
  authDomain: "dispatchtoolnextjs.firebaseapp.com",
  projectId: "dispatchtoolnextjs",
  storageBucket: "dispatchtoolnextjs.appspot.com",
  messagingSenderId: "1079114075967",
  appId: "1:1079114075967:web:ac766fcc6a413b8ded0d8a",
  measurementId: "G-0PMMXXG258"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Analytics if window is defined (client-side only)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics may fail in some environments (e.g., SSR)
    if (process.env.NODE_ENV === "development") {
      console.warn("Firebase Analytics not initialized:", e);
    }
  }
}
export { analytics };
