import { useState } from 'react';
import { useLogout } from '../hooks/useLogout';

export default function LogoutButton({ className = '' }) {
  const { handleLogout, loading } = useLogout();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const confirmLogout = async () => {
    setShowConfirmModal(false);
    await handleLogout();
  };

  return (
    <>
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={loading}
        className={`
        inline-flex items-center gap-2
        rounded-lg border border-red-600
        bg-red-600 px-4 py-2
        text-sm font-semibold text-black
        shadow-sm transition-all
        hover:bg-red-700 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        active:scale-95
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
      >
        <svg
          className={`h-5 w-5 transition-transform ${
            loading ? 'animate-spin' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>

      {loading ? 'Logging out...' : 'Logout'}
    </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Logout</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600">Are you sure you want to logout? You will need to login again to access your account.</p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging out...' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
