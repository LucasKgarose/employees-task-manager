import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create an invitation for a new user
 * @param {string} email - User's email
 * @param {string} role - Assigned role (employee, manager, org_admin)
 * @param {string} organizationId - Organization ID
 * @param {string} invitedBy - UID of the admin who created the invitation
 * @returns {Object} - Invitation object with token
 */
export async function createInvitation(email, role, organizationId, invitedBy) {
  try {
    // Check if invitation already exists for this email
    const existingQuery = query(
      collection(db, 'invitations'),
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error('An active invitation already exists for this email');
    }

    // Generate secure token
    const token = generateInvitationToken();
    
    // Create invitation document
    const invitationData = {
      email: email.toLowerCase(),
      role,
      token,
      invitedBy,
      status: 'pending', // pending, accepted, expired
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    // Only add organizationId if it's provided
    if (organizationId) {
      invitationData.organizationId = organizationId;
    }

    const docRef = await addDoc(collection(db, 'invitations'), invitationData);

    return {
      id: docRef.id,
      ...invitationData,
      invitationLink: `${window.location.origin}/register?token=${token}`
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

/**
 * Validate an invitation token
 * @param {string} token - Invitation token
 * @returns {Object|null} - Invitation data if valid, null otherwise
 */
export async function validateInvitationToken(token) {
  try {
    const q = query(
      collection(db, 'invitations'),
      where('token', '==', token),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const invitationDoc = querySnapshot.docs[0];
    const invitation = { id: invitationDoc.id, ...invitationDoc.data() };

    // Check if expired
    const expiresAt = invitation.expiresAt?.toDate() || new Date(invitation.expiresAt);
    if (expiresAt < new Date()) {
      await updateDoc(doc(db, 'invitations', invitation.id), {
        status: 'expired'
      });
      return null;
    }

    return invitation;
  } catch (error) {
    console.error('Error validating token:', error);
    return null;
  }
}

/**
 * Mark invitation as accepted
 * @param {string} invitationId - Invitation document ID
 * @param {string} userId - New user's UID
 */
export async function acceptInvitation(invitationId, userId) {
  try {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      userId
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Get all pending invitations for an organization
 * @param {string} organizationId - Organization ID
 * @returns {Array} - List of pending invitations
 */
export async function getPendingInvitations(organizationId) {
  try {
    let q;
    
    if (organizationId) {
      // Query by organizationId if provided
      q = query(
        collection(db, 'invitations'),
        where('organizationId', '==', organizationId),
        where('status', '==', 'pending')
      );
    } else {
      // Query all pending invitations if no organizationId
      q = query(
        collection(db, 'invitations'),
        where('status', '==', 'pending')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
}

/**
 * Revoke/delete an invitation
 * @param {string} invitationId - Invitation document ID
 */
export async function revokeInvitation(invitationId) {
  try {
    await deleteDoc(doc(db, 'invitations', invitationId));
  } catch (error) {
    console.error('Error revoking invitation:', error);
    throw error;
  }
}

/**
 * Resend invitation (generates new token and extends expiry)
 * @param {string} invitationId - Invitation document ID
 * @returns {Object} - Updated invitation with new token
 */
export async function resendInvitation(invitationId) {
  try {
    const newToken = generateInvitationToken();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await updateDoc(doc(db, 'invitations', invitationId), {
      token: newToken,
      expiresAt: newExpiresAt,
      resentAt: serverTimestamp()
    });

    return {
      token: newToken,
      invitationLink: `${window.location.origin}/register?token=${newToken}`
    };
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
}

/**
 * Clean up expired invitations (can be run periodically)
 */
export async function cleanupExpiredInvitations() {
  try {
    const q = query(
      collection(db, 'invitations'),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    const now = new Date();
    const batch = [];

    querySnapshot.forEach((docSnapshot) => {
      const invitation = docSnapshot.data();
      const expiresAt = invitation.expiresAt?.toDate() || new Date(invitation.expiresAt);
      
      if (expiresAt < now) {
        batch.push(
          updateDoc(doc(db, 'invitations', docSnapshot.id), {
            status: 'expired'
          })
        );
      }
    });

    await Promise.all(batch);
    return batch.length;
  } catch (error) {
    console.error('Error cleaning up invitations:', error);
    throw error;
  }
}
