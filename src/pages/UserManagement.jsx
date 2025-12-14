import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { updateUserRole } from '../utils/userManagement';
import { createNewUser } from '../utils/createUser';
import { ROLES } from '../models';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: ROLES.EMPLOYEE
  });
  const [adminCredentials, setAdminCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdating(userId);
      await updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      showSuccess('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!createForm.email || !createForm.password || !createForm.fullName || !createForm.phoneNumber) {
      showError('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      
      // Store current admin's email
      const currentAdminEmail = auth.currentUser?.email;
      
      // Create new user (this will sign out the admin)
      await createNewUser(
        createForm.email,
        createForm.password,
        createForm.fullName,
        createForm.phoneNumber,
        createForm.role
      );
      
      // Re-authenticate the admin
      if (currentAdminEmail && adminCredentials.email && adminCredentials.password) {
        await signInWithEmailAndPassword(auth, adminCredentials.email, adminCredentials.password);
      }
      
      // Refresh users list
      await fetchUsers();
      
      // Reset form
      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: ROLES.EMPLOYEE
      });
      setShowCreateForm(false);
      
      showSuccess('User created successfully! You have been re-authenticated.');
    } catch (error) {
      console.error('Error creating user:', error);
      showError(`Failed to create user: ${error.message}`);
      
      // Try to re-authenticate admin if something went wrong
      if (adminCredentials.email && adminCredentials.password) {
        try {
          await signInWithEmailAndPassword(auth, adminCredentials.email, adminCredentials.password);
        } catch (reAuthError) {
          showError(`Please log in again as admin ${reAuthError}`);
        }
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading users" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toast {...toast} onClose={hideToast} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Create New User
          </button>
        </div>

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Create New User</h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({
                      email: '',
                      password: '',
                      fullName: '',
                      phoneNumber: '',
                      role: ROLES.EMPLOYEE
                    });
                    setAdminCredentials({
                      email: '',
                      password: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Warning Message */}
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Important:</strong> Creating a user from the client-side will temporarily sign you out. 
                    Please enter your admin credentials below to automatically re-authenticate after user creation.
                  </p>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  {/* Admin Re-authentication Section */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-3">Your Admin Credentials (for re-authentication)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Email
                        </label>
                        <input
                          type="email"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Password
                        </label>
                        <input
                          type="password"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* New User Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={createForm.fullName}
                        onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={createForm.phoneNumber}
                        onChange={(e) => setCreateForm({...createForm, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        minLength="6"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={createForm.role}
                        onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setCreateForm({
                          email: '',
                          password: '',
                          fullName: '',
                          phoneNumber: '',
                          role: ROLES.EMPLOYEE
                        });
                        setAdminCredentials({
                          email: '',
                          password: ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Current Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Update Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">{user.fullName || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {user.role || 'employee'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role || 'employee'}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Role Hierarchy:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Org Admin</strong> - Full access, can manage all users and tasks</li>
          <li>• <strong>Managers</strong> (Legal, Consulting, Office, General) - Can approve timesheets and manage subordinates</li>
          <li>• <strong>Attorney / Candidate Attorney</strong> - Professional staff roles</li>
          <li>• <strong>Debt Collector</strong> - Specialized role</li>
          <li>• <strong>Employee</strong> - Basic access, can manage own tasks</li>
        </ul>
      </div>
      </div>
    </DashboardLayout>
  );
}
