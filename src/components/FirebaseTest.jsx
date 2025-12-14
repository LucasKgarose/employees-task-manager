import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

export default function FirebaseTest() {
  const [status, setStatus] = useState("Testing...");
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    const testFirebase = async () => {
      try {
        addLog("✓ Firebase imported successfully");
        addLog("✓ Auth module initialized");
        addLog("✓ Firestore database initialized");
        
        // Test user creation (optional - comment out if you don't want to create a test user)
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = "TestPassword123!";
        
        addLog(`Creating test user: ${testEmail}`);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          testEmail,
          testPassword
        );
        addLog(`✓ User created: ${userCredential.user.uid}`);

        // Test Firestore write
        addLog("Writing test data to Firestore...");
        const docRef = await addDoc(collection(db, "test"), {
          message: "Firebase is working!",
          timestamp: new Date(),
          userId: userCredential.user.uid,
        });
        addLog(`✓ Document created in Firestore: ${docRef.id}`);

        // Sign out
        await signOut(auth);
        addLog("✓ User signed out");

        setStatus("✅ Firebase is working correctly!");
      } catch (error) {
        addLog(`❌ Error: ${error.message}`);
        setStatus("❌ Firebase test failed");
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Firebase Configuration Test</h1>
        <div className="bg-gray-800 p-6 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-4">{status}</h2>
          <div className="bg-gray-900 p-4 rounded font-mono text-sm space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="text-green-400">
                {log}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-yellow-900 text-yellow-100 p-4 rounded">
          <p className="text-sm">
            <strong>Note:</strong> Once Firebase credentials are added to firebase.js and this test passes, delete this component.
          </p>
        </div>
      </div>
    </div>
  );
}
