import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export function useLogout() {
  const { logout } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err);
      console.error('Logout failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogout,
    loading,
    error,
  };
}