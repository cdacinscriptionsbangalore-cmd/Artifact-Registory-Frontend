// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { authStore } from "@/store/authStore";
import { authClient } from "@/utils/http/clients/authClient.client";
import { apiClient } from "@/utils/http/clients/backendApiClientGeneral";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loginSuccess = (token: string) => {
    authStore.setToken(token);
    console.log("Token received in AuthContext:", token);
    if (typeof token === "undefined" || token === null) {
      try {
        const stack = new Error().stack;
        console.warn("loginSuccess called with undefined token, stack:\n", stack);
      } catch { }
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    authStore.clear();
    try {
      setIsAuthenticated(false);
      const res = await apiClient.post("/oauth2/logout");
      console.log("Logout response:", res);
      if (res.status === 200) {
        console.log("Logout successful");
        window.location.href = "/login";
        return true;
      }
    } catch (error) {
      console.error("Logout failed:", {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
      });
      return false;
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      try {
        console.log("AuthContext.bootstrap: attempting refresh-token call");
        const res = await authClient.post("/oauth2/authenticated/refresh-token");
        console.log("AuthContext.bootstrap: refresh response:", res && res.data);

        const token = res?.data?.auth_token || res?.data?.data?.accessToken || res?.data?.token;
        console.log("AuthContext.bootstrap: computed token:", token);
        if (token) {
          loginSuccess(token);
          console.log("useEffect in AuthContext: User is authenticated.");
        } else {
          console.warn("AuthContext.bootstrap: no token found in refresh response", res?.data);
          logout();
        }
      } catch (error) {
        console.error("AuthContext.bootstrap: refresh failed:", {
          message: (error as any)?.message,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    // run only once on mount
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginSuccess, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
