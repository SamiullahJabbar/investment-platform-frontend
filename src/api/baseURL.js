const BASE_URL = "http://127.0.0.1:8001/api"; 

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
