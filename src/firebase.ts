import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWD4oVVXQjkx4S5GyUceYZEC9gXOm-dys",
  authDomain: "lojista-vip.firebaseapp.com",
  projectId: "lojista-vip",
  storageBucket: "lojista-vip.firebasestorage.app",
  messagingSenderId: "136672504878",
  appId: "1:136672504878:web:9cb15b423ff309dac643bf",
  measurementId: "G-JVEXTZDZP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services needed by the app context
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;