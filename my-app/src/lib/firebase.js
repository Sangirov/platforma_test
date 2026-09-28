import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGyDDljbO46GM8ncU9O6a1kSoJG36PcS8",
  authDomain: "ta-lim-sifati-ilg-or-texnikum.firebaseapp.com",
  projectId: "ta-lim-sifati-ilg-or-texnikum",
  storageBucket: "ta-lim-sifati-ilg-or-texnikum.firebasestorage.app",
  messagingSenderId: "362947390669",
  appId: "1:362947390669:web:6dbd55a8547785d07e4d84",
  measurementId: "G-BJ9ZRX0SFM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);