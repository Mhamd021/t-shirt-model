import {
  ACCESS_TOKEN_KEY,
  apiClient,
  DEMO_MODE_MESSAGE,
  getApiErrorMessage,
  isDemoMode,
} from "./apiClient";

const saveSession = ({ access_token, user }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  }

  return { success: true, token: access_token, user, message: DEMO_MODE_MESSAGE };
};

export const login = async (email, password) => {
  if (isDemoMode) {
    const user = {
      id: "demo-user",
      name: email.split("@")[0] || "Demo user",
      email,
    };

    return saveSession({ access_token: "demo-token", user });
  }

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
  if (isDemoMode) {
    const user = { id: "demo-user", name, email };
    return saveSession({ access_token: "demo-token", user });
  }

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
  if (isDemoMode) {
    if (typeof window === "undefined") return null;
    return { id: "demo-user", name: "Demo user", email: "demo@example.com" };
  }

  const { data } = await apiClient.get("/auth/me");
  return data;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};
