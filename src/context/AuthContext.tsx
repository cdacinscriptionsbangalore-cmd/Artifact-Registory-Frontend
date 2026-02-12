// context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { authStore } from "@/store/authStore";
import { authClient } from "@/utils/http/clients/authClient.client";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginSuccess = (token: string) => {
    authStore.setToken(token);
    console.log("Token received in AuthContext:", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authStore.clear();
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await authClient.post("/oauth2/authenticated/refresh-token");
        loginSuccess(res.data.auth_token);
        console.log("useEffect in AuthContext: User is authenticated: ", res.data.auth_token);
      } catch (error) {
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, loginSuccess, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
