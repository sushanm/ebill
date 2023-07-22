// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDcyLlUK_tx6OApFIHT2bMA6uX6aXhyKj0",
    authDomain: "emedical-375ba.firebaseapp.com",
    projectId: "emedical-375ba",
    storageBucket: "emedical-375ba.appspot.com",
    messagingSenderId: "832489079505",
    appId: "1:832489079505:web:6665ba7e77bc20bd29bbf0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db = getFirestore(app);