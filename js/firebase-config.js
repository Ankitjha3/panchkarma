import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, onSnapshot, orderBy, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcybODgYa4wUihtB2rpaN3PXpd15prgfA",
  authDomain: "panchkarma-80eb4.firebaseapp.com",
  projectId: "panchkarma-80eb4",
  storageBucket: "panchkarma-80eb4.firebasestorage.app",
  messagingSenderId: "553486751172",
  appId: "1:553486751172:web:5f98eadeb2358f11110091",
  measurementId: "G-WJSJH0TWZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Firestore functions for use in dashboards
export { doc, collection, query, where, getDocs, getDoc, addDoc, onSnapshot, orderBy, serverTimestamp, deleteDoc, updateDoc };

/**
 * Handle user login
 */
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Fetch user role and info from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    throw new Error("User record not found in database.");
  }
  
  const userData = userDoc.data();
  // Cache in localStorage for synchronous access across pages
  localStorage.setItem('pk_user', JSON.stringify(userData));
  return userData;
}

/**
 * Handle user signup
 */
export async function signupUser(name, email, password, role) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: name,
    role: role,
    createdAt: new Date().toISOString()
  };
  
  // Store user info in Firestore
  await setDoc(doc(db, "users", user.uid), userData);
  
  // Cache in localStorage
  localStorage.setItem('pk_user', JSON.stringify(userData));
  return userData;
}

/**
 * Handle Google Sign-in
 */
export async function googleSignIn(requestedRole = null, whatsappNumber = null) {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  // Check if user exists in Firestore
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);
  
  let userData;
  if (!userDoc.exists()) {
    // New Google user
    userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Google User",
      role: requestedRole || 'patient', // Default to patient if none provided
      whatsappNumber: whatsappNumber || '',
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, userData);
  } else {
    userData = userDoc.data();
    // Allow the user to change their role or whatsappNumber if they use the Signup page again
    const updates = {};
    if (requestedRole && userData.role !== requestedRole) updates.role = requestedRole;
    if (whatsappNumber && userData.whatsappNumber !== whatsappNumber) updates.whatsappNumber = whatsappNumber;
    
    if (Object.keys(updates).length > 0) {
      Object.assign(userData, updates);
      await setDoc(userDocRef, updates, { merge: true });
    }
  }
  
  localStorage.setItem('pk_user', JSON.stringify(userData));
  return userData;
}

/**
 * Get current user from localStorage (synchronous)
 */
export function getCurrentUser() {
  const stored = localStorage.getItem('pk_user');
  return stored ? JSON.parse(stored) : null;
}

/**
 * Logout
 */
export async function logout() {
  await signOut(auth);
  localStorage.removeItem('pk_user');
  window.location.href = 'login.html';
}

/**
 * Redirect based on user role
 */
export function redirectToDashboard(user) {
  switch (user.role) {
    case 'practitioner':
      window.location.href = 'practitioner-dashboard.html';
      break;
    case 'admin':
      window.location.href = 'admin-dashboard.html';
      break;
    case 'patient':
    default:
      window.location.href = 'patient-dashboard.html';
      break;
  }
}

/**
 * Fetch users from Firestore based on their role
 */
export async function searchUsersByRole(role) {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", role));
  const querySnapshot = await getDocs(q);
  
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push(doc.data());
  });
  return users;
}

/**
 * Check auth state — redirect if not logged in
 */
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// Make globally available for inline event handlers in HTML
window.logout = logout;
window.requireAuth = requireAuth;
window.getCurrentUser = getCurrentUser;

// Keep localStorage synced with Firebase Auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    localStorage.removeItem('pk_user');
    // If on a dashboard page, redirect to login
    if (window.location.pathname.includes('dashboard')) {
      window.location.href = 'login.html';
    }
  }
});
