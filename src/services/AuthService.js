import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail // <--- Added this import
} from 'firebase/auth';
import { app } from '../../firebaseConfig'; 

// Initialize Auth
const auth = getAuth(app);

// --- Core Auth Functions ---

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let msg = error.message;
    if (msg.includes('auth/invalid-credential')) msg = 'Invalid email or password.';
    return { user: null, error: msg };
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// --- NEW FUNCTION (Fixes the crash) ---
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// --- The Listener ---
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};