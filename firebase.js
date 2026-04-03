import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB29IE0PVxYN0OGJWbK3AdBX8wrX68ja9k",
  authDomain: "qr-message-app.firebaseapp.com",
  projectId: "qr-message-app",
  storageBucket: "qr-message-app.firebasestorage.app",
  messagingSenderId: "173024470469",
  appId: "1:173024470469:web:bf10c0d0d1885b990017ac"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);