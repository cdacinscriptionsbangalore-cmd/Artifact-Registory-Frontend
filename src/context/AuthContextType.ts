import React from "react";
// import type { User } from "@/types";

interface AuthContextType {
    isAuthenticated: boolean;
    setToken: (token: string | null) => void;
    getToken: () => string | null;
    clear: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
    isAuthenticated: false,
    setToken: () => { },
    getToken: () => null,
    clear: () => { },
});

export default AuthContext;
