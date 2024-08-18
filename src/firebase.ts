import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCFUl9ujCTX2eWSfe2r7zZLemjA7N_xdIA",
    authDomain: "print-api-screen.firebaseapp.com",
    projectId: "print-api-screen",
    storageBucket: "print-api-screen.appspot.com",
    messagingSenderId: "74795789965",
    appId: "1:74795789965:web:1fa4b541cb37d173713cc4",
};

export const fireApp = initializeApp(firebaseConfig);

export const db = getFirestore(fireApp);
