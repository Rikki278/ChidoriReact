import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
    setTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      
      if (!accessToken || !refreshToken) {
        console.error('Invalid tokens provided:', { accessToken, refreshToken });
        return;
      }

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      console.log('Tokens stored successfully');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.accessToken = null;
      state.refreshToken = null;
      
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      console.log('Logged out successfully');
    },
    updateAccessToken: (state, action) => {
      if (!action.payload) {
        console.error('Invalid access token provided for update');
        return;
      }
      
      state.accessToken = action.payload;
      localStorage.setItem('accessToken', action.payload);
      console.log('Access token updated successfully');
    },
  },
});

export const { 
  setUser, 
  setTokens, 
  setLoading, 
  setError, 
  logout,
  updateAccessToken 
} = authSlice.actions;

export default authSlice.reducer; 