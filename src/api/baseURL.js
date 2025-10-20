const BASE_URL = "http://16.171.174.65:8000/api"; 

// FIX: Now uses the correct key 'accessToken'
export const saveAccessToken = (token) => {
  if (token) {
    sessionStorage.setItem("accessToken", token);
  }
};

export const getAccessToken = () => {
  return sessionStorage.getItem("accessToken");
};

// Added helper for refreshToken as it's used in cleanup
export const saveRefreshToken = (token) => {
  if (token) {
    sessionStorage.setItem("refreshToken", token);
  }
};

export const removeTokens = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

export default BASE_URL;
