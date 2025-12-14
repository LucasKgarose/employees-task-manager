import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
import DashboardLayout from "../components/DashboardLayout";
import {
  createInvitation,
  getPendingInvitations,
  revokeInvitation,
  resendInvitation,
} from "../utils/invitationService";

export default function InvitationManager() {
  const { currentUser } = useUser();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    role: "employee",
  });

  useEffect(() => {
    loadInvitations();
  }, [currentUser]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const data = await getPendingInvitations(
        currentUser?.organizationId || null
      );
      setInvitations(data);
    } catch {
      showError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const invitation = await createInvitation(
        formData.email,
        formData.role,
        currentUser.organizationId,
        currentUser.uid
      );

      await navigator.clipboard.writeText(invitation.invitationLink);
      showSuccess("Invitation created and link copied");

      setFormData({ email: "", role: "employee" });
      setIsModalOpen(false);
      loadInvitations();
    } catch (err) {
      showError(err.message || "Failed to create invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  const roleBadge = (role) => {
    const base =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    if (role === "org_admin")
      return `${base} bg-red-50 text-red-700`;
    if (role === "manager")
      return `${base} bg-amber-50 text-amber-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  if (currentUser?.role !== "org_admin") {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Access restricted
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Only organization administrators can manage invitations.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toast {...toast} onClose={hideToast} />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              User invitations
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Invite users and manage pending access
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Invite user
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Expires</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-gray-500">
                    Loading invitations…
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-500">
                    No pending invitations
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {inv.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={roleBadge(inv.role)}>
                        {inv.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(inv.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        onClick={() => resendInvitation(inv.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => revokeInvitation(inv.id)}
                        className="ml-4 text-red-600 hover:text-red-700"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create invitation
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="org_admin">Organization admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Create invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
