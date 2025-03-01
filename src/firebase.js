import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD3alUHIykfvKxCpGFwlU5NhkDbtWAI4JM",
  authDomain: "pyqs-5fb6f.firebaseapp.com",
  databaseURL: "https://pyqs-5fb6f-default-rtdb.firebaseio.com",
  projectId: "pyqs-5fb6f",
  storageBucket: "pyqs-5fb6f.firebasestorage.app",
  messagingSenderId: "387349289109",
  appId: "1:387349289109:web:d6076ed6b02fe54cc6239c",
  measurementId: "G-PZK69Y8163"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);