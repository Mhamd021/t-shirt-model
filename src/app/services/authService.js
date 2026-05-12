import { ACCESS_TOKEN_KEY, apiClient, getApiErrorMessage } from "./apiClient";

const saveSession = ({ access_token, user }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  return { success: true, token: access_token, user };
};

export const login = async (email, password) => {
  try {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return saveSession(data);
  } catch (error) {
    return {
      success: false,
      message: getApiErrorMessage(error),
      status: error.response?.status ?? 0,
    };
  }
};

export const register = async (name, email, password) => {
  try {
    const { data } = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return saveSession(data);
  } catch (error) {
    return {
      success: false,
      message: getApiErrorMessage(error),
      status: error.response?.status ?? 0,
    };
  }
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};
