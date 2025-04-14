// auth.js

let currentClient = null;

// Initialize Firebase services (already available from index.html)
const db = window.firebaseDb;
const auth = window.firebaseAuth;
const { signInWithEmailAndPassword, signOut } = auth;
const { doc, getDoc } = db;

// Function to authenticate user with Firebase Authentication
async function authenticate(email, password) {
    console.log("Authenticating user:", email);
    try {
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user role and branding from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            console.log("User data not found in Firestore");
            throw new Error("User data not found.");
        }

        const userData = userDoc.data();
        const role = userData.role; // "admin" or "user"
        const branding = userData.branding; // { name, address, phone }

        // Set currentClient for compatibility with existing code
        currentClient = {
            email: user.email,
            uid: user.uid,
            role: role,
            branding: branding // Add branding information
        };

        console.log(`User authenticated as ${role}:`, user.uid);
        return { role: role, clientId: user.uid };
    } catch (error) {
        console.error("Authentication failed:", error.message);
        return null;
    }
}

// Function to log out
async function logout() {
    try {
        await signOut(auth);
        currentClient = null;
        console.log("User logged out successfully");
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
}

// Function to get the current authenticated user
function getCurrentClient() {
    console.log("Getting current client:", currentClient);
    return currentClient;
}

// Function to get client branding
function getClientBranding() {
    console.log("Getting client branding:", currentClient ? currentClient.branding : null);
    return currentClient ? currentClient.branding : null;
}

// Expose functions to the global scope
window.authenticate = authenticate;
window.logout = logout;
window.getCurrentClient = getCurrentClient;
window.getClientBranding = getClientBranding;