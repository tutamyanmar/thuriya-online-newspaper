// Firebase Configuration - FIXED VERSION
const firebaseConfig = {
    apiKey: "AIzaSyA2fT5IjoIkmol4nufob-YSY3xbU5wV0UU",
    authDomain: "thuriya-online-newspaper.firebaseapp.com",
    projectId: "thuriya-online-newspaper",
    storageBucket: "thuriya-online-newspaper.appspot.com",
    messagingSenderId: "339188278267",
    appId: "1:339188278267:web:916881e3e9b7649d60a15e"
};

// Initialize Firebase
let app, db, auth;

try {
    if (firebase && firebase.apps && firebase.apps.length === 0) {
        app = firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized successfully");
    } else if (firebase && firebase.apps && firebase.apps.length > 0) {
        app = firebase.app();
        console.log("✅ Firebase already initialized");
    }
    
    // Initialize services
    if (firebase.firestore) {
        db = firebase.firestore();
        
        // Important: Settings for production
        db.settings({
            experimentalForceLongPolling: true
        });
        
        console.log("✅ Firestore initialized");
    }
    
    if (firebase.auth) {
        auth = firebase.auth();
        console.log("✅ Auth initialized");
    }
    
} catch (error) {
    console.error("❌ Firebase initialization error:", error);
}

// Export to window object
window.firebaseApp = app;
window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseConfig = firebaseConfig;

// Shortcuts
window.db = db;
window.auth = auth;

console.log("🚀 Firebase Config Loaded Successfully!");
