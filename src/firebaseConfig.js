// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
