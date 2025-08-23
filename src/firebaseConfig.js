// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAcrFwjAhF7cHjpn9bd4dLRwtdLvVIMKM",
  authDomain: "elevator-21186.firebaseapp.com",
  projectId: "elevator-21186",
  storageBucket: "elevator-21186.firebasestorage.app",
  messagingSenderId: "1007104607472",
  appId: "1:1007104607472:web:7c251e101b12ac6364ae35",
  measurementId: "G-MYBM4BJ7ZJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);

// Set global variables for compatibility with existing FirebaseContext
if (typeof window !== 'undefined') {
  window.__firebase_config = JSON.stringify(firebaseConfig);
  window.__app_id = "elevator-21186"; // Use the projectId as app ID
}
