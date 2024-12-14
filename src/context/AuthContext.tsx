import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, provider, db } from '../services/firebaseConfig';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Function to store user data in Firestore
  const storeUserInFirestore = async (currentUser: User) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous',
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        createdAt: new Date(),
      }, { merge: true }); // Merge ensures existing fields are not overwritten
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;
      setUser(currentUser);

      // Store user data in Firestore
      await storeUserInFirestore(currentUser);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) storeUserInFirestore(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
