import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Creates a new user with Firebase Auth and Firestore profile
 * Note: This will sign out the current admin user when called from client-side.
 * For production, this should be implemented using Firebase Cloud Functions with Admin SDK.
 * 
 * Cloud Function example:
 * exports.createUser = functions.https.onCall(async (data, context) => {
 *   const { email, password, fullName, role } = data;
 *   const userRecord = await admin.auth().createUser({ email, password });
 *   await admin.firestore().collection('users').doc(userRecord.uid).set({
 *     email, fullName, role, createdAt: new Date().toISOString()
 *   });
 *   return { uid: userRecord.uid };
 * });
 */
export async function createNewUser(email, password, fullName, role) {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore profile
    await setDoc(doc(db, 'users', user.uid), {
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
    });

    return { success: true, uid: user.uid };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
