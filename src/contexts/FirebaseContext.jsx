// src/contexts/FirebaseContext.js
import React, { createContext, useState, useEffect } from 'react';
import { app } from '../firebaseConfig';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    console.log("FirebaseContext: Initializing Firebase services");
    const firestore = getFirestore(app);
    const firebaseAuth = getAuth(app);

    console.log("FirebaseContext: Firebase services initialized", { firestore, firebaseAuth });
    setDb(firestore);
    setAuth(firebaseAuth);

    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    console.log("FirebaseContext: Initial auth token", initialAuthToken);

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      console.log("FirebaseContext: Auth state changed", user);
      if (user) {
        console.log("FirebaseContext: User is signed in", user.uid);
        setUserId(user.uid);
      } else {
        console.log("FirebaseContext: No user signed in, attempting login...");
        try {
          if (initialAuthToken) {
            console.log("FirebaseContext: Trying custom token login...");
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
          } else {
            console.log("FirebaseContext: Trying email/password login...");
            // TODO: move these credentials into .env
            await signInWithEmailAndPassword(firebaseAuth, "test@elevator.com", "password123");
          }
        } catch (error) {
          console.error("Login error:", error);
          // Last fallback: anonymous (only works if enabled in Firebase Console)
          try {
            await signInAnonymously(firebaseAuth);
          } catch (anonError) {
            console.error("Anonymous login failed:", anonError);
          }
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ db, auth, userId, isAuthReady }}>
      {children}
    </FirebaseContext.Provider>
  );
};
