import React from "react";
// import type { User } from "@/types";

interface AuthContextType {
    isAuthenticated: boolean;
    getToken: () => string | null;
    clear: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
    isAuthenticated: false,
    getToken: () => null,
    clear: () => { },
});

export default AuthContext;
