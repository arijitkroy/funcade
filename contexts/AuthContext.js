import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';

const AuthContext = createContext({});

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            totalPoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            createdAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.warn("Firebase permissions error: Please update your Firestore rules to allow read/write to the 'users' collection.", err);
      }
    }

    return user;
  };

  const signInAnonymously = async (displayName) => {
    const result = await firebaseSignInAnonymously(auth);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
