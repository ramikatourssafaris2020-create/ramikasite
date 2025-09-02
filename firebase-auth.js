// Firebase Auth module
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  remove,
  get,
  onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeCjerHDeNeskBzVMMcz82UDy4v7-gHCM",
  authDomain: "ramika-safaris.firebaseapp.com",
  projectId: "ramika-safaris",
  storageBucket: "ramika-safaris.firebasestorage.app",
  messagingSenderId: "684999593043",
  appId: "1:684999593043:web:21d91f59dfb4bca9818aa6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// Helper: redirect on successful auth
function redirectToLanding() {
  window.location.href = 'landing.html';
}

// Sign in with Google (popup)
export async function signInWithGoogle() {
  // let errors bubble to caller so caller can update UI
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  // update DB record (merge)
  if (user) {
    await update(ref(db, `users/${user.uid}`), {
      fullName: user.displayName || null,
      email: user.email || null,
      lastLogin: Date.now()
    });
  }
  // If successful, redirect
  redirectToLanding();
  return result;
}

// Email/password sign up
export async function signUpWithEmail(fullName, email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  // set displayName on auth profile for the created user
  try {
    await updateProfile(user, { displayName: fullName });
  } catch (e) {
    console.warn('updateProfile failed', e);
  }
  // write user record to Realtime Database
  try {
    await set(ref(db, `users/${user.uid}`), {
      fullName: fullName,
      email: email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      isAdmin: false
    });
  } catch (e) {
    console.error('Failed to write user to database', e);
  }
  redirectToLanding();
  return userCred;
}

// Email/password sign in
export async function signInWithEmailAddr(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const user = userCred.user;
  // update last login in DB
  try {
    if (user) await update(ref(db, `users/${user.uid}`), { lastLogin: Date.now() });
  } catch (e) {
    console.error('Failed to update lastLogin', e);
  }
  redirectToLanding();
  return userCred;
}

// Sign out
import { signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
export async function signOutUser() {
  await signOut(auth);
  // After sign out, go to sign-in
  window.location.href = 'sign-in.html';
}

// Wire DOM buttons if present
function wireUp() {
  // Sign-in page
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }
      setProcessing(signInBtn, true, 'Signing in...');
      try {
        await signInWithEmailAddr(email, password);
        // successful — redirect handled in function
      } catch (err) {
        console.error(err);
        alert(err.message || err);
        setProcessing(signInBtn, false);
      }
    });
  }

  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      setProcessing(googleSignInBtn, true, 'Opening Google...');
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error(err);
        alert(err.message || err);
        setProcessing(googleSignInBtn, false);
      }
    });
  }

  // Sign-up page
  const signUpBtn = document.getElementById('signUpBtn');
  if (signUpBtn) {
    signUpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      if (!fullName || !email || !password) {
        alert('Please complete name, email and password');
        return;
      }
      setProcessing(signUpBtn, true, 'Creating account...');
      try {
        await signUpWithEmail(email, password);
      } catch (err) {
        console.error(err);
        alert(err.message || err);
        setProcessing(signUpBtn, false);
      }
    });
  }

  const googleSignUpBtn = document.getElementById('googleSignUpBtn');
  if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      setProcessing(googleSignUpBtn, true, 'Opening Google...');
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error(err);
        alert(err.message || err);
        setProcessing(googleSignUpBtn, false);
      }
    });
  }
}

// UI helper to set processing state on a button
function setProcessing(btn, isProcessing, text) {
  if (!btn) return;
  if (isProcessing) {
    btn.dataset.origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text || 'Processing...'} `;
    btn.classList.add('opacity-75');
  } else {
    btn.disabled = false;
    if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
    btn.classList.remove('opacity-75');
  }
}

// If user already signed in, redirect immediately
// Keep current user in global for other pages to use
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  window.__currentUser = user;
  // wire buttons when auth state is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireUp);
  } else {
    wireUp();
  }
});

// Initialize landing page: populate user name and enforce auth
// Wait for the first auth state change (or timeout) and return the user (or null)
function waitForAuthState(timeoutMs = 3000) {
  return new Promise((resolve) => {
    let resolved = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(user);
      }
    });
    // timeout fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { unsubscribe(); } catch (e) {}
        // resolve with current sync value (may be null)
        resolve(auth.currentUser || null);
      }
    }, timeoutMs);
  });
}

export async function initLanding() {
  // Wait for auth state to settle (up to 3s). This avoids redirecting when Firebase
  // hasn't rehydrated the persisted user yet after navigation.
  const user = await waitForAuthState(3000);
  if (!user) {
    // truly not signed in -> redirect to sign-in
    window.location.href = 'sign-in.html';
    return;
  }

  // populate UI
  const nameEls = document.querySelectorAll('#userName');
  const displayName = user.displayName || user.email || 'User';
  nameEls.forEach(el => el.textContent = displayName);
  // wire logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOutUser();
      } catch (err) {
        console.error('Sign out failed', err);
        alert('Sign out failed: ' + (err.message || err));
      }
    });
  }
}

// Expose for debugging
window.__firebaseAuth = { signInWithGoogle, signUpWithEmail, signInWithEmailAddr };
