// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

let dataFromLocal = JSON.parse(localStorage.getItem('getDrKotianConnection'));
let arryData = []
if (dataFromLocal) {
    arryData = dataFromLocal.split(';');
}else{
    let config = prompt('Provide Configuration');
    localStorage.setItem("getDrKotianConnection", JSON.stringify(config));
    arryData = config.split(';');
}

const firebaseConfig = {
    apiKey: arryData[0],
    authDomain: arryData[1],
    projectId: arryData[2],
    storageBucket: arryData[3],
    messagingSenderId: arryData[4],
    appId: arryData[5]
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);