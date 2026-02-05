// ============================================
// Firebase Configuration for Thuriya Online Newspaper
// ============================================

// 🔥 IMPORTANT: Replace these values with YOUR Firebase project configuration
// Get these from Firebase Console > Project Settings > General > Your apps > Web app

const firebaseConfig = {
    apiKey: "AIzaSyA2fT5IjoIkmol4nufob-YSY3xbU5wV0UU",
    authDomain: "thuriya-online-newspaper.firebaseapp.com",
    projectId: "thuriya-online-newspaper",
    storageBucket: "thuriya-online-newspaper.firebasestorage.app",
    messagingSenderId: "339188278267",
    appId: "1:339188278267:web:916881e3e9b7649d60a15e"
};

// ============================================
// Firebase Initialization
// ============================================

// Check if Firebase is already initialized to avoid duplicates
if (!firebase.apps.length) {
    try {
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized successfully!");
        
        // Log project info for debugging
        console.log("📊 Project: " + firebaseConfig.projectId);
        console.log("🌐 Auth Domain: " + firebaseConfig.authDomain);
        
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        alert("Firebase initialization failed. Please check console for details.");
    }
} else {
    console.log("ℹ️ Firebase already initialized");
}

// ============================================
// Firebase Service Exports
// ============================================

// Firestore Database instance
const db = firebase.firestore();

// Authentication instance
const auth = firebase.auth();

// Storage instance (for future use with images)
// const storage = firebase.storage();

// ============================================
// Firestore Settings (Optional)
// ============================================

// Enable offline persistence (caches data for offline use)
db.enablePersistence()
    .then(() => {
        console.log("💾 Offline persistence enabled");
    })
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("⚠️ Multiple tabs open, offline persistence disabled");
        } else if (err.code == 'unimplemented') {
            console.warn("⚠️ Browser doesn't support offline persistence");
        }
    });

// Set Firestore settings (optional)
const firestoreSettings = {
    // cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    // experimentalForceLongPolling: true, // for some network environments
};

// Apply settings
// db.settings(firestoreSettings);

// ============================================
// Authentication State Listener
// ============================================

// Track authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("👤 User logged in:", user.email);
        console.log("🆔 User UID:", user.uid);
        
        // Update UI for logged-in state
        updateUIForAuthState(true, user);
        
    } else {
        console.log("👤 No user logged in");
        
        // Update UI for logged-out state
        updateUIForAuthState(false, null);
    }
});

// ============================================
// Helper Functions
// ============================================

/**
 * Update UI elements based on authentication state
 * @param {boolean} isLoggedIn - Whether user is logged in
 * @param {object} user - Firebase user object
 */
function updateUIForAuthState(isLoggedIn, user) {
    // This function will be called by other pages to update their UI
    // Each page should implement its own UI update logic
    console.log(`🔄 Auth state changed: ${isLoggedIn ? 'Logged In' : 'Logged Out'}`);
}

/**
 * Get current user's data from Firestore
 * @returns {Promise} User document from Firestore
 */
async function getCurrentUserData() {
    if (!auth.currentUser) {
        console.warn("No user logged in");
        return null;
    }
    
    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        
        if (userDoc.exists) {
            console.log("📄 User data loaded from Firestore");
            return userDoc.data();
        } else {
            console.warn("User document doesn't exist in Firestore");
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login result
 */
async function loginUser(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        console.log("✅ Login successful for:", email);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("❌ Login error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Logout current user
 * @returns {Promise} Logout result
 */
async function logoutUser() {
    try {
        await auth.signOut();
        console.log("✅ Logout successful");
        return { success: true };
    } catch (error) {
        console.error("❌ Logout error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user has admin/editor role
 * @returns {Promise<boolean>} Whether user is admin/editor
 */
async function isUserAdmin() {
    const userData = await getCurrentUserData();
    
    if (!userData) return false;
    
    // Check if user has admin or editor role
    return userData.role === 'admin' || userData.role === 'editor';
}

/**
 * Add a new news article to Firestore
 * @param {object} newsData - News article data
 * @returns {Promise} Add result
 */
async function addNewsArticle(newsData) {
    try {
        // Add timestamp and user info
        const completeNewsData = {
            ...newsData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            reporterId: auth.currentUser ? auth.currentUser.uid : null,
            views: 0,
            likes: 0,
            published: newsData.published || false,
            status: newsData.published ? 'published' : 'draft'
        };
        
        const docRef = await db.collection('news').add(completeNewsData);
        console.log("✅ News article added with ID:", docRef.id);
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("❌ Error adding news article:", error);
        return { success: false, error: error.message };
    }
}

// ============================================
// Data Loading Functions
// ============================================

/**
 * Load all categories from Firestore
 * @returns {Promise} Categories array
 */
async function loadCategories() {
    try {
        const snapshot = await db.collection('categories')
            .orderBy('order', 'asc')
            .get();
        
        const categories = [];
        snapshot.forEach(doc => {
            categories.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📂 Loaded ${categories.length} categories`);
        return categories;
    } catch (error) {
        console.error("❌ Error loading categories:", error);
        return [];
    }
}

/**
 * Load news articles with optional filtering
 * @param {object} options - Filtering options
 * @returns {Promise} News articles array
 */
async function loadNewsArticles(options = {}) {
    try {
        let query = db.collection('news');
        
        // Apply filters
        if (options.publishedOnly !== false) {
            query = query.where('published', '==', true);
        }
        
        if (options.categoryId) {
            query = query.where('categoryId', '==', options.categoryId);
        }
        
        // Apply sorting
        if (options.sortBy === 'oldest') {
            query = query.orderBy('createdAt', 'asc');
        } else if (options.sortBy === 'views') {
            query = query.orderBy('views', 'desc');
        } else {
            // Default: newest first
            query = query.orderBy('createdAt', 'desc');
        }
        
        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const snapshot = await query.get();
        
        const articles = [];
        snapshot.forEach(doc => {
            articles.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`📰 Loaded ${articles.length} news articles`);
        return articles;
    } catch (error) {
        console.error("❌ Error loading news articles:", error);
        return [];
    }
}

// ============================================
// Error Handling
// ============================================

// Global error handler for Firebase operations
window.handleFirebaseError = function(error) {
    console.error("🔥 Firebase Error:", error);
    
    let userMessage = "System error occurred. Please try again.";
    
    // Common Firebase error messages
    if (error.code === 'permission-denied') {
        userMessage = "You don't have permission to perform this action.";
    } else if (error.code === 'unauthenticated') {
        userMessage = "Please login to continue.";
    } else if (error.code === 'not-found') {
        userMessage = "The requested data was not found.";
    } else if (error.message) {
        userMessage = error.message;
    }
    
    // Show error to user (you can customize this)
    alert(userMessage);
    
    return userMessage;
};

// ============================================
// Export to Global Scope
// ============================================

// Make Firebase services available globally
window.firebaseApp = firebase.app();
window.firebaseDB = db;
window.firebaseAuth = auth;
// window.firebaseStorage = storage;

// Export helper functions
window.firebaseHelpers = {
    loginUser,
    logoutUser,
    getCurrentUserData,
    isUserAdmin,
    addNewsArticle,
    loadCategories,
    loadNewsArticles,
    handleFirebaseError
};

// Debug info
console.log("🚀 Firebase Config Loaded");
console.log("📁 Database:", db.app.name);
console.log("🔐 Auth:", auth.app.name);
