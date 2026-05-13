import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAG4CvF_FnFkp2koYFGfdMZafkANGBpwhc",
  authDomain: "luah-rasa--ai.firebaseapp.com",
  projectId: "luah-rasa--ai",
  storageBucket: "luah-rasa--ai.firebasestorage.app",
  messagingSenderId: "153570705746",
  appId: "1:153570705746:web:02f1c361ca6f4090b4fa8b",
  measurementId: "G-FB0RCEWWER"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);