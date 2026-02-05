// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2fT5IjoIkmol4nufob-YSY3xbU5wV0UU",
    authDomain: "thuriya-online-newspaper.firebaseapp.com",
    projectId: "thuriya-online-newspaper",
    storageBucket: "AIzaSyA2fT5IjoIkmol4nufob-YSY3xbU5wV0UU",
    messagingSenderId: "339188278267",
    appId: "1:339188278267:web:916881e3e9b7649d60a15e"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("✅ Firebase initialized");
}

// Export services
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

// Export to window object
window.firebaseDB = db;
window.firebaseAuth = auth;
window.firebaseHelpers = {
    loadCategories,
    loadNewsArticles
};
