import { useDispatch, useSelector } from 'react-redux';
import { setUser, setTokens, logout, updateAccessToken, setLoading, setError } from '../store/slices/authSlice';
import { isTokenExpired, getTokenPayload } from '../utils/tokenUtils';
import { authAPI } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, accessToken, refreshToken, loading, error } = useSelector(
    (state) => state.auth
  );

  const validateCredentials = (credentials) => {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    if (!credentials.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
  };

  const validateUserData = (userData) => {
    if (!userData.email || !userData.password || !userData.username) {
      throw new Error('Email, password, and username are required');
    }
    if (!userData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (userData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }
  };

  const login = async (credentials) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      validateCredentials(credentials);
      const response = await authAPI.login(credentials);
      
      if (!response.token || !response.refreshToken) {
        throw new Error('Invalid response from server: missing tokens');
      }

      console.log('Login successful, storing tokens...');
      dispatch(setTokens({ 
        accessToken: response.token,
        refreshToken: response.refreshToken 
      }));
      
      // if (!response.user) {
      //   throw new Error('Invalid response from server: missing user data');
      // }
      
      dispatch(setUser(response.user));
      console.log('Login process completed successfully');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch(setError(errorMessage));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (userData) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      validateUserData(userData);
      const response = await authAPI.register(userData);
      
      const { accessToken, refreshToken, user } = response;
      dispatch(setTokens({ accessToken, refreshToken }));
      dispatch(setUser(user));
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch(setError(errorMessage));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      dispatch(setLoading(false));
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return false;

    try {
      dispatch(setLoading(true));
      const response = await authAPI.refreshToken(refreshToken);
      const { accessToken } = response;
      
      dispatch(updateAccessToken(accessToken));
      return true;
    } catch (error) {
      dispatch(logout());
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const checkAuth = async () => {
    if (!accessToken) return false;
    
    if (isTokenExpired(accessToken)) {
      if (refreshToken) {
        return await refreshAccessToken();
      }
      dispatch(logout());
      return false;
    }
    
    try {
      dispatch(setLoading(true));
      const userData = await authAPI.getCurrentUser();
      dispatch(setUser(userData));
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    refreshAccessToken,
    checkAuth,
  };
}; 