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
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const newToken = api.login.handleCallback();
        if (newToken) setToken(newToken);
        else setLoading(false);
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        api.login.getUserProfile(token)
            .then((r: any) => {
                setUser(r.data)
                setLoading(false)
            })
            .catch(() => {
                localStorage.removeItem('dt-token');
                setToken(null);
                setLoading(false);
            });
    }, [token]);

    const logout = () => {
        api.login.logout();
        setUser(null);
        setToken(null);
        localStorage.removeItem('dt-token') 
        window.location.href = '/'
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, logout }}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;