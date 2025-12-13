import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

// Firebase CRUD hook for tasks
export function useFirebaseTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time listener
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Create
  const addTask = useCallback(async (task) => {
    try {
      await addDoc(collection(db, 'tasks'), task);
    } catch (err) {
      setError(err);
    }
  }, []);

  // Read single
  const getTask = useCallback(async (id) => {
    try {
      const docRef = doc(db, 'tasks', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  // Update
  const updateTask = useCallback(async (id, updates) => {
    try {
      const docRef = doc(db, 'tasks', id);
      await updateDoc(docRef, updates);
    } catch (err) {
      setError(err);
    }
  }, []);

  // Delete
  const deleteTask = useCallback(async (id) => {
    try {
      const docRef = doc(db, 'tasks', id);
      await deleteDoc(docRef);
    } catch (err) {
      setError(err);
    }
  }, []);

  // Filtered query (by assignee, etc.)
  const getTasksByField = useCallback(async (field, value) => {
    try {
      const q = query(collection(db, 'tasks'), where(field, '==', value));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      setError(err);
      return [];
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    getTask,
    updateTask,
    deleteTask,
    getTasksByField,
  };
}
