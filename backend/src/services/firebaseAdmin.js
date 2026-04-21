/**
 * Firebase Admin SDK — used to verify Firebase Phone Auth ID tokens
 *
 * Setup:
 *   1. Go to Firebase Console → Project Settings → Service accounts
 *   2. Click "Generate new private key" → download JSON
 *   3. Set these env vars in backend/.env from that JSON file:
 *
 *   FIREBASE_PROJECT_ID=your-project-id
 *   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
 *   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n"
 *
 *   NOTE: FIREBASE_PRIVATE_KEY must have literal \n chars (not real newlines) in .env
 */

const admin = require('firebase-admin');

let initialized = false;

function getAdmin() {
  if (!initialized) {
    const projectId    = process.env.FIREBASE_PROJECT_ID;
    const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey   = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });

    initialized = true;
    console.log('[Firebase Admin] Initialized ✅');
  }
  return admin;
}

/**
 * Verify a Firebase ID token from the frontend.
 * Returns the decoded token (contains uid, phone_number, etc.)
 */
async function verifyFirebaseToken(idToken) {
  const a = getAdmin();
  return a.auth().verifyIdToken(idToken);
}

module.exports = { verifyFirebaseToken };
