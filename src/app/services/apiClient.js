import axios from "axios";

export const ACCESS_TOKEN_KEY = "accessToken";
export const DEMO_MODE_MESSAGE =
  "Demo mode is active. Backend features are disabled for this live preview.";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();
export const isDemoMode = process.env.NEXT_PUBLIC_ENABLE_BACKEND !== "true";

export const apiClient = axios.create({
  baseURL: API_URL || undefined,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isDemoMode) {
    config.headers["X-Demo-Mode"] = "true";
  }

  return config;
});

export const getApiErrorMessage = (error) => {
  if (error.response?.data?.message) {
    const { message } = error.response.data;
    return Array.isArray(message) ? message.join(", ") : message;
  }

  if (error.response) return "Request failed. Please try again.";
  return "Network error. Please check your connection.";
};
