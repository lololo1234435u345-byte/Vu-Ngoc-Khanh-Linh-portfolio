// js/firebase-config.js

/* 
 * PLACEHOLDER: FIREBASE CONFIGURATION
 * 
 * Replace the firebaseConfig object below with your actual project config from Firebase Console.
 * Make sure to enable Firestore in your Firebase project.
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if config has been updated (not using placeholder values)
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Initialize Firestore
        window.db = firebase.firestore();
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization error:", error);
        window.db = null;
    }
} else {
    console.warn("Firebase is not configured yet. The 'Message in a bottle' form is running in DEMO mode.");
    window.db = null; // main.js will check for this to run demo mode
}
