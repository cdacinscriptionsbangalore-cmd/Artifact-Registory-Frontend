import AuthContext from "@/context/AuthContextType";
import { authStore } from "@/store/authStore";

export const isAuthenticated = (): boolean => {
  return authStore.getToken() !== null;
};

export const setAuthToken = (token: string): void => {
  authStore.setToken(token);
};

export const removeAuthToken = (): void => {
  authStore.clear();
};

export const logout = (): void => {
  authStore.clear();
};