import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5UNeFMQdkL-nHSpYBQAHY24cj9Wl76I0",
  authDomain: "stockmarketpredictions-dcbf6.firebaseapp.com",
  projectId: "stockmarketpredictions-dcbf6",
  storageBucket: "stockmarketpredictions-dcbf6.appspot.com",
  messagingSenderId: "708358532107",
  appId: "1:708358532107:web:821bb76a5d564b7b74eb0e",
  measurementId: "G-HBGBVPED86",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider(); // Add Google Auth Provider
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
