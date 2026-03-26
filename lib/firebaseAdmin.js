import admin from 'firebase-admin';

export function getAdminApp() {
  if (!admin.apps.length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId) {
        console.error('FIREBASE_PROJECT_ID is missing in environment variables.');
      }

      if (clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        admin.initializeApp({
          projectId: projectId || undefined,
        });
      }
    } catch (error) {
      console.error('Firebase admin initialization error:', error.message);
      throw error;
    }
  }
  return admin.app();
}

export function getAdminDb() {
  return getAdminApp().firestore();
}

export const adminDb = new Proxy({}, {
  get(target, prop) {
    const db = getAdminDb();
    const value = db[prop];
    return typeof value === 'function' ? value.bind(db) : value;
  }
});
