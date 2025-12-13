import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Create or update user profile in Firestore
 * @param {string} uid - User ID from Firebase Auth
 * @param {object} userData - User data to store
 */
export async function createUserProfile(uid, userData) {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Get user profile from Firestore
 * @param {string} uid - User ID
 * @returns {object|null} User profile data
 */
export async function getUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Update user role
 * @param {string} uid - User ID
 * @param {string} role - New role
 */
export async function updateUserRole(uid, role) {
  try {
    await setDoc(doc(db, 'users', uid), {
      role,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}
