// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGcxatI9ety1LyOAJXuJWcYBqSMQI_7y8",
  authDomain: "employees-task-manager.firebaseapp.com",
  projectId: "employees-task-manager",
  storageBucket: "employees-task-manager.firebasestorage.app",
  messagingSenderId: "595882310778",
  appId: "1:595882310778:web:b0925cf86d6e0d5c3a0fc3",
  measurementId: "G-SSHHGFERPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);