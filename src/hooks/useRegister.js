import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from '../utils/userManagement';

export function useRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('employee'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const register = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user data in Firestore with role
      await createUserProfile(user.uid, {
        uid: user.uid,
        fullName: fullName.trim(),
        email: email.toLowerCase(),
        role: role, // Store the selected role
      });

      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setRole('employee');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    email,
    password,
    confirmPassword,
    fullName,
    role,
    loading,
    error,
    success,
    // Handlers
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    setRole,
    register,
  };
}
