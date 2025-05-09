// Token expiration check
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Get token payload
export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

// Get user ID from token
export const getUserIdFromToken = (token) => {
  const payload = getTokenPayload(token);
  return payload?.sub || null;
};

// Get token expiration time
export const getTokenExpirationTime = (token) => {
  const payload = getTokenPayload(token);
  return payload?.exp ? payload.exp * 1000 : null;
}; 