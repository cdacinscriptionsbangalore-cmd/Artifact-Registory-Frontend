// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useRef } from "react";
import { authStore } from "@/store/authStore";
import { authClient } from "@/utils/http/clients/authClient.client";
import { apiClient } from "@/utils/http/clients/backendApiClientGeneral";
import { setPostLoginRedirect } from "@/utils/postLoginRedirect";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (token: string) => void;
  logout: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoginSucceededRef = useRef(false);

  const loginSuccess = (token: string) => {
    authStore.setToken(token);
    hasLoginSucceededRef.current = true;
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
        return true;
      }
      return false;
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
          // Avoid stale bootstrap response overriding a successful OAuth callback login.
          if (!hasLoginSucceededRef.current && !authStore.getToken()) {
            authStore.clear();
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("AuthContext.bootstrap: refresh failed:", {
          message: (error as any)?.message,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
        });
        // Avoid stale bootstrap failure overriding a successful OAuth callback login.
        if (!hasLoginSucceededRef.current && !authStore.getToken()) {
          authStore.clear();
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
    // run only once on mount
  }, []);

  // Listen for global unauthorized events emitted by axios interceptors
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("AuthContext: received app:unauthorized event, forcing logout");
      try {
        authStore.clear();
      } catch {}

      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const isAuthFlowPath = window.location.pathname === "/login" || window.location.pathname === "/oauth/callback";
      if (!isAuthFlowPath) {
        setPostLoginRedirect(currentPath);
      }

      setIsAuthenticated(false);
      setIsLoading(false);
      // navigate to login (hard navigation ensures a clean state)
      if (!isAuthFlowPath) {
        window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
      } else {
        window.location.href = "/login";
      }
    };

    window.addEventListener("app:unauthorized", handleUnauthorized as EventListener);
    return () => window.removeEventListener("app:unauthorized", handleUnauthorized as EventListener);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginSuccess, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
