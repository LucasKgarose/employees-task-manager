import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import CenteredFormLayout from "../components/CenteredFormLayout";
import {
  validateInvitationToken,
  acceptInvitation,
} from "../utils/invitationService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);
  const [validating, setValidating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Validate invitation token on mount
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setError(
          "No invitation token provided. Please request an invitation from your organization admin."
        );
        setValidating(false);
        return;
      }

      try {
        const invitationData = await validateInvitationToken(token);
        if (!invitationData) {
          setError(
            "Invalid or expired invitation link. Please request a new invitation."
          );
          setValidating(false);
          return;
        }

        setInvitation(invitationData);
        setValidating(false);
      } catch (err) {
        setError("Failed to validate invitation. Please try again.");
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        invitation.email,
        formData.password
      );

      const user = userCredential.user;

      // Create user document in Firestore with invitation role
      const userData = {
        email: invitation.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: invitation.role,
        createdAt: serverTimestamp(),
        invitedBy: invitation.invitedBy,
      };

      // Only add organizationId if it exists
      if (invitation.organizationId) {
        userData.organizationId = invitation.organizationId;
      }

      await setDoc(doc(db, "users", user.uid), userData);

      // Mark invitation as accepted
      await acceptInvitation(invitation.id, user.uid);

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Loading state
  if (validating) {
    return (
      <CenteredFormLayout>
        <div className="text-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 font-medium">Validating invitation...</p>
        </div>
      </CenteredFormLayout>
    );
  }

  // Invalid invitation
  if (!invitation) {
    return (
      <CenteredFormLayout>
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/login" className="btn-primary inline-flex">
            Go to Login
          </Link>
        </div>
      </CenteredFormLayout>
    );
  }

  return (
    <CenteredFormLayout>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Registration
        </h2>
        <p className="text-gray-600">
          You've been invited to join the organization
        </p>
      </div>

      {/* Invitation Info Card */}
      <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {invitation.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{invitation.email}</p>
            <p className="text-sm text-gray-600">
              Role:{" "}
              <span className="badge badge-primary capitalize ml-1">
                {invitation.role.replace("_", " ")}
              </span>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              Account created successfully! Redirecting...
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            disabled={loading}
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
            disabled={loading}
          />
        </div>

        {/* Email (Read-only) */}
        {/* <div>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={invitation.email}
            className="form-input bg-gray-100 cursor-not-allowed"
            disabled
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Email is pre-assigned from your invitation
          </p>
        </div> */}

        {/* Role (Read-only) */}
        {/* <div>
          <label className="form-label">Assigned Role</label>
          <input
            type="text"
            value={invitation.role.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            className="form-input bg-gray-100 cursor-not-allowed capitalize"
            disabled
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Role is pre-assigned by your organization admin
          </p>
        </div> */}

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password (min 6 characters)"
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Complete Registration"}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Login here
        </Link>
      </p>
    </CenteredFormLayout>
  );
}

