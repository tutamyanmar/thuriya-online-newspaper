// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2fT5IjoIkmol4nufob-YSY3xbU5wV0UU",
    authDomain: "thuriya-online-newspaper.firebaseapp.com",
    projectId: "thuriya-online-newspaper",
    storageBucket: "thuriya-online-newspaper.appspot.com",
    messagingSenderId: "339188278267",
    appId: "1:339188278267:web:916881e3e9b7649d60a15e"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized for Thuriya News");
}
// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

// Helper functions
async function loadCategories() {
    try {
        const snapshot = await db.collection('categories').orderBy('order').get();
        const categories = [];
        snapshot.forEach(doc => {
            categories.push({ id: doc.id, ...doc.data() });
        });
        return categories;
    } catch (error) {
        console.error("Error loading categories:", error);
        return [];
    }
}

async function loadNewsArticles(options = {}) {
    try {
        let query = db.collection('news').where('published', '==', true);
        
        if (options.categoryId) {
            query = query.where('categoryId', '==', options.categoryId);
        }
        
        query = query.orderBy('createdAt', 'desc');
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const snapshot = await query.get();
        const articles = [];
        snapshot.forEach(doc => {
            articles.push({ id: doc.id, ...doc.data() });
        });
        return articles;
    } catch (error) {
        console.error("Error loading news:", error);
        return [];
    }
}

// Login function
async function loginUser(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout function
async function logoutUser() {
    try {
        await auth.signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Export everything to window object
window.firebaseApp = firebase.app();
window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseConfig = firebaseConfig;

window.firebaseHelpers = {
    loadCategories,
    loadNewsArticles,
    loginUser,
    logoutUser
};

// Shortcut for easy access
window.db = db;
window.auth = auth;

console.log("🚀 Firebase Config Loaded Successfully!");
console.log("📊 Project:", firebaseConfig.projectId);
};
// Add timeout and retry logic
const MAX_RETRIES = 3;
let retryCount = 0;

function initializeFirebaseWithRetry() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized");
        }
        
        window.firebaseApp = firebase.app();
        window.firebaseDB = firebase.firestore();
        window.firebaseAuth = firebase.auth();
        
        // Enable offline persistence
        firebase.firestore().enablePersistence()
            .then(() => console.log("📱 Offline persistence enabled"))
            .catch(err => console.log("Offline persistence error:", err));
            
        console.log("🚀 Firebase services ready!");
        return true;
    } catch (error) {
        console.error("Firebase init error:", error);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(initializeFirebaseWithRetry, 2000);
        } else {
            console.error("Max retries reached. Firebase failed to initialize.");
            return false;
        }
    }
}

// Initialize with retry
initializeFirebaseWithRetry();
