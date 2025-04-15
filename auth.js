// auth.js

// Firebase configuration (replace with your own!)
const firebaseConfig = {
    apiKey: "AIzaSyByqSaTo2ciVTEJ-U3Ppq6pHVpF6uQQBvM",
    authDomain: "pmt1-35077.firebaseapp.com",
    projectId: "pmt1-35077",
    storageBucket: "pmt1-35077.firebasestorage.app",
    messagingSenderId: "830179042835",
    appId: "1:830179042835:web:5450243bc3773da34801e6",
    measurementId: "G-RC4D69CQ88"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

async function authenticate(email, password) {
    try {
        // Firebase Authentication login
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return { role: userData.role, uid: user.uid }; // Return role and UID
        } else {
            throw new Error('User role not found.');
        }

    } catch (error) {
        console.error('Firebase login error:', error);
        throw error;
    }
}

async function addUserToFirestore(uid, email, role) {
    try {
        await db.collection('users').doc(uid).set({
            email: email,
            role: role
        });
    } catch (error) {
        console.error('Error adding user to Firestore:', error);
        throw error;
    }
}

async function addNewUser(email, password, role) {
    try {
        // Create user in Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Add user data to Firestore
        await addUserToFirestore(user.uid, email, role);

        return true; // Indicate success
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

async function updateUserPassword(email, newPassword) {
    try {
        // Find the user by email (Firebase doesn't directly support updating by username)
        const usersSnapshot = await auth.fetchSignInMethodsForEmail(email);
        if (usersSnapshot && usersSnapshot.length > 0) {
            // Get the list of users
            const allUsers = auth.currentUser;
            if (allUsers) {
                // Update the password
                await allUsers.updatePassword(newPassword);
                return true;
            } else {
                throw new Error('No user is currently signed in.');
            }
        } else {
            throw new Error('User not found.');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}

async function deleteUser(email) {
    try {
        // Find the user by email
        const users = await auth.fetchSignInMethodsForEmail(email);
        if (users && users.length > 0) {
            // Get the list of users
            const allUsers = await auth.listUsers();
            // Find the user to delete
            const userToDelete = allUsers.users.find(user => user.email === email);
            if (userToDelete) {
                // Delete the user
                await auth.deleteUser(userToDelete.uid);
                return true;
            } else {
                throw new Error('User not found.');
            }
        } else {
            throw new Error('User not found.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

window.authenticate = authenticate;
window.addNewUser = addNewUser;
window.updateUserPassword = updateUserPassword;
window.deleteUser = deleteUser;