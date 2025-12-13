import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { getUserProfile } from '../utils/userManagement';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore to get role
          const userProfile = await getUserProfile(user.uid);
          
          const userWithRole = {
            ...user,
            role: userProfile?.role || 'employee', // Default to 'employee' if no role set
            displayName: user.displayName || userProfile?.fullName || user.email,
            fullName: userProfile?.fullName || user.displayName,
          };
          setCurrentUser(userWithRole);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback if Firestore fetch fails
          const userWithRole = {
            ...user,
            role: 'employee',
            displayName: user.displayName || user.email,
          };
          setCurrentUser(userWithRole);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
