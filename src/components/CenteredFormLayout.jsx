import React from "react";

/**
 * CenteredFormLayout: Wraps children in a responsive, centered container.
 * Usage: <CenteredFormLayout>...form...</CenteredFormLayout>
 */
export default function CenteredFormLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}
