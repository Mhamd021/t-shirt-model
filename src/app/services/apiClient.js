import axios from "axios";

export const ACCESS_TOKEN_KEY = "accessToken";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://t-shirt-backend-server-production.up.railway.app";

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
