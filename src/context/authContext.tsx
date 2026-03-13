import React, { useEffect, useState, createContext } from 'react';
import { api } from '../services';

export type AuthContextProps = {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    token: null,
    isAuthenticated: false,
    logout: () => { },
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('dt-token'));

    useEffect(() => {
        // GitHub'dan callback ile gelen token'ı yakala
        const newToken = api.login.handleCallback();
        if (newToken) setToken(newToken);
    }, []);

    useEffect(() => {
        if (!token) return;
        api.login.getMe(token)
            .then((r: any) => setUser(r.data))
            .catch(() => {
                localStorage.removeItem('dt-token');
                setToken(null);
            });
    }, [token]);

    const logout = () => {
        api.login.logout();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;