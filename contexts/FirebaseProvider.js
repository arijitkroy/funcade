import { createContext, useContext, useEffect, useState } from "react";
import { initFirebase } from "@/lib/firebaseClient";

const FirebaseContext = createContext(null);

export function FirebaseProvider({ children }) {
  const [firebase, setFirebase] = useState(null);

  useEffect(() => {
    async function loadFirebase() {
      const instance = await initFirebase();
      setFirebase(instance);
    }

    loadFirebase();
  }, []);

  if (!firebase) {
    return null;
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (!context) {
    throw new Error("useFirebase must be used inside FirebaseProvider");
  }

  return context;
}