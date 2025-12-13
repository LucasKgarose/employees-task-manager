import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { updateUserRole } from '../utils/userManagement';
import { ROLES } from '../models';
import { useNavigate } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

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
      alert('Failed to fetch users');
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
      
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>

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
  );
}
