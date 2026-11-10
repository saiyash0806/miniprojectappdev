import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC2nVSpz3q-fZqBiVkv8zxxbvWsLOuiiGE",
  authDomain: "miniproject-e3353.firebaseapp.com",
  projectId: "miniproject-e3353",
  storageBucket: "miniproject-e3353.firebasestorage.app",
  messagingSenderId: "1069940685876",
  appId: "1:1069940685876:web:d5a6210c6a2cd8d0549e61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// getAuth automatically handles standard browser persistence on Web 
// and in-memory/default persistence on Expo
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);