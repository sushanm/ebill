// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Production
const firebaseConfig = {
    apiKey: "AIzaSyDcyLlUK_tx6OApFIHT2bMA6uX6aXhyKj0",
    authDomain: "emedical-375ba.firebaseapp.com",
    projectId: "emedical-375ba",
    storageBucket: "emedical-375ba.appspot.com",
    messagingSenderId: "832489079505",
    appId: "1:832489079505:web:6665ba7e77bc20bd29bbf0"
};

// Testing
// const firebaseConfig = {
//     apiKey: "AIzaSyC9hXzf6zXa7Ys08oPOX6gYW1YkjH5-aP4",
//     authDomain: "cloud-billing-ca31e.firebaseapp.com",
//     projectId: "cloud-billing-ca31e",
//     storageBucket: "cloud-billing-ca31e.appspot.com",
//     messagingSenderId: "8155494527",
//     appId: "1:8155494527:web:103bf601ea1cfa463a674a"
//   };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db = getFirestore(app);