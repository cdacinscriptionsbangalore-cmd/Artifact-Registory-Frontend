import React, { useState } from 'react'
import AuthContext from './AuthContextType.ts';

const AuthState = (props: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);

    const getToken = () => {
        return token;
    }

    const clear = () => {
        setToken(null);
    }

    // const isAuthenticated = (): boolean => {
    //     return token !== null;
    // }

    const value = {
        getToken,
        setToken,
        clear,
        isAuthenticated: token !== null
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthState
