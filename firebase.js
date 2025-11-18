// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAahQLFxStqkWUWiLukFXao_gBmifwOxBE",
  authDomain: "spinach-billing-system.firebaseapp.com",
  databaseURL: "https://spinach-billing-system-default-rtdb.firebaseio.com",
  projectId: "spinach-billing-system",
  storageBucket: "spinach-billing-system.firebasestorage.app",
  messagingSenderId: "187341684924",
  appId: "1:187341684924:web:a01f580c5cf0d0df29d0b9",
  measurementId: "G-7EDM2PLL9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);