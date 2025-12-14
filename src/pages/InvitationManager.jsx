import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useToast } from "../hooks/useToast";
import Toast from "../components/Toast";
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
      const data = await getPendingInvitations(currentUser?.organizationId || null);
      setInvitations(data);
    } catch {
      showError("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.role) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      const invitation = await createInvitation(
        formData.email,
        formData.role,
        currentUser.organizationId || null,
        currentUser.uid
      );

      await navigator.clipboard.writeText(invitation.invitationLink);
      showSuccess("Invitation created & link copied!");

      setFormData({ email: "", role: "employee" });
      setIsModalOpen(false);
      loadInvitations();
    } catch (error) {
      showError(error.message || "Failed to create invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async (token) => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/register?token=${token}`
      );
      showSuccess("Link copied to clipboard");
    } catch {
      showError("Failed to copy link");
    }
  };

  const handleResend = async (id) => {
    try {
      const res = await resendInvitation(id);
      await navigator.clipboard.writeText(res.invitationLink);
      showSuccess("New invitation link copied");
      loadInvitations();
    } catch {
      showError("Failed to resend invitation");
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm("Revoke this invitation?")) return;
    try {
      await revokeInvitation(id);
      showSuccess("Invitation revoked");
      loadInvitations();
    } catch {
      showError("Failed to revoke invitation");
    }
  };

  const roleStyles = {
    org_admin: "bg-red-100 text-red-700",
    manager: "bg-amber-100 text-amber-700",
    employee: "bg-gray-100 text-gray-700",
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  if (currentUser?.role !== "org_admin") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-20 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Access Restricted
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Only organization administrators can manage invitations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast {...toast} onClose={hideToast} />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            User Invitations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Invite users and manage pending access
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          + Invite User
        </button>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-900">
          Pending Invitations
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">
            No pending invitations
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3 text-left">Expires</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyles[inv.role]}`}
                      >
                        {inv.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(inv.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(inv.expiresAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleCopyLink(inv.token)}
                        className="rounded-md p-2 hover:bg-gray-100"
                        title="Copy link"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleResend(inv.id)}
                        className="rounded-md p-2 hover:bg-gray-100"
                        title="Resend"
                      >
                        🔁
                      </button>
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                        title="Revoke"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Invitation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="org_admin">Organization Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create & Copy Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
