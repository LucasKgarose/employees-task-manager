import React from "react";
import { Link } from "react-router-dom";
import CenteredFormLayout from "../components/CenteredFormLayout";
import { useRegister } from "../hooks/useRegister";
import { ROLES } from "../models";

export default function Register() {
  const {
    email,
    password,
    confirmPassword,
    fullName,
    role,
    loading,
    error,
    success,
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    setRole,
    register,
  } = useRegister();

  return (
    <CenteredFormLayout>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Create Account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Registration successful! Redirecting...
        </div>
      )}

      <form onSubmit={register} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value={ROLES.EMPLOYEE}>Employee</option>
            <option value={ROLES.DEBT_COLLECTOR}>Debt Collector</option>
            <option value={ROLES.CANDIDATE_ATTORNEY}>Candidate Attorney</option>
            <option value={ROLES.ATTORNEY}>Attorney</option>
            <option value={ROLES.OFFICE_MANAGER}>Office Manager</option>
            <option value={ROLES.MANAGER}>Manager</option>
            <option value={ROLES.CONSULTING_MANAGER}>Consulting Manager</option>
            <option value={ROLES.LEGAL_MANAGER}>Legal Manager</option>
            <option value={ROLES.ORG_ADMIN}>Org Admin</option>
          </select>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      {/* Login Link */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Login here
        </Link>
      </p>
    </CenteredFormLayout>
  );
}

