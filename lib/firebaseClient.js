import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

let firebaseInstance = null;

export async function initFirebase() {
  if (firebaseInstance) return firebaseInstance;

  const res = await fetch("/api/firebase-config");
  const config = await res.json();

  const app = getApps().length ? getApp() : initializeApp(config);

  let db;
  db = getFirestore(app);

  const auth = getAuth(app);

  firebaseInstance = { app, db, auth };
  return firebaseInstance;
}