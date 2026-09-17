import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, logout: clearAuth } = useAuthStore();

  const login = async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.login(payload);
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      navigate('/dashboard');
      return true;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await authApi.register(payload);
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
      return true;
    } catch (err) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  return { login, register, logout, loading };
}