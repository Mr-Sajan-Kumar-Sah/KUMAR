import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCWMMjn8zoqd9FBSLe8GU0kxzuvPtgd26o",
    authDomain: "sajankumar-7fe56.firebaseapp.com",
    projectId: "sajankumar-7fe56",
    storageBucket: "sajankumar-7fe56.firebasestorage.app",
    messagingSenderId: "530497965075",
    appId: "1:530497965075:web:a29f682c663c1d13b283e6",
    measurementId: "G-4HDJ9D9R32"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, remove };