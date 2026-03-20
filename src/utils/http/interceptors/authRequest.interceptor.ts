import { authStore } from "../../../store/authStore";
import axios, { type AxiosInstance } from "axios";

let hasDispatchedUnauthorized = false;

const dispatchUnauthorized = () => {
  if (hasDispatchedUnauthorized) return;
  hasDispatchedUnauthorized = true;
  try {
    window.dispatchEvent(new CustomEvent("app:unauthorized"));
  } catch {
    window.location.href = "/login";
  }
};

export const attachAuthToken = (client: AxiosInstance) => {
  client.interceptors.request.use((config) => {
    const token = authStore.getToken();
    if (token) {
      hasDispatchedUnauthorized = false;
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    dispatchUnauthorized();
    return Promise.reject(new axios.CanceledError("Missing access token"));
  });
};
