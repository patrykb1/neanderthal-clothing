// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADcp0nQjTQw452mF1TPmQX9RiWp3bSrxc",
  authDomain: "neanderthal-clothing.firebaseapp.com",
  projectId: "neanderthal-clothing",
  storageBucket: "neanderthal-clothing.firebasestorage.app",
  messagingSenderId: "565685203706",
  appId: "1:565685203706:web:6d156e10bd29a7724ecf43",
  measurementId: "G-JPDHLMB4PN"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function initializeAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const analyticsSupported = await isSupported();
    return analyticsSupported ? getAnalytics(app) : null;
  } catch (_error) {
    return null;
  }
}