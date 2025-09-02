// Firebase Auth module
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

// Helper: redirect on successful auth
function redirectToLanding() {
  // Use relative redirect
  window.location.href = 'landing.html';
}

// Sign in with Google (popup)
export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
    redirectToLanding();
  } catch (err) {
    console.error('Google sign-in failed', err);
    alert('Google sign-in failed: ' + (err.message || err));
  }
}

// Email/password sign up
export async function signUpWithEmail(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    redirectToLanding();
  } catch (err) {
    console.error('Sign up failed', err);
    alert('Sign up failed: ' + (err.message || err));
  }
}

// Email/password sign in
export async function signInWithEmailAddr(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    redirectToLanding();
  } catch (err) {
    console.error('Sign in failed', err);
    alert('Sign in failed: ' + (err.message || err));
  }
}

// Wire DOM buttons if present
function wireUp() {
  // Sign-in page
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }
      signInWithEmailAddr(email, password);
    });
  }

  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signInWithGoogle();
    });
  }

  // Sign-up page
  const signUpBtn = document.getElementById('signUpBtn');
  if (signUpBtn) {
    signUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();
      const password = document.getElementById('password')?.value;
      if (!fullName || !email || !password) {
        alert('Please complete name, email and password');
        return;
      }
      // optionally save fullName to profile later
      signUpWithEmail(email, password);
    });
  }

  const googleSignUpBtn = document.getElementById('googleSignUpBtn');
  if (googleSignUpBtn) {
    googleSignUpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signInWithGoogle();
    });
  }
}

// If user already signed in, redirect immediately
onAuthStateChanged(auth, (user) => {
  if (user) {
    redirectToLanding();
  } else {
    // wire buttons when auth state is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireUp);
    } else {
      wireUp();
    }
  }
});

// Expose for debugging
window.__firebaseAuth = { signInWithGoogle, signUpWithEmail, signInWithEmailAddr };
