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
        // GitHub'dan callback ile gelen token'ı yakala
        const newToken = api.login.handleCallback();
        if (newToken) setToken(newToken);
        else setLoading(false);
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        api.login.getMe(token)
            .then((r: any) => {
                setUser(r.data)
                setLoading(false)   // ← kullanıcı gelince kapat
                console.log('user: ', r.data)
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
        localStorage.removeItem('dt-token')  // ← bu çalışıyor mu?
        window.location.href = '/'
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, logout }}>
            {loading ? null : children}  {/* ← loading bitene kadar hiçbir şey render etme */}
        </AuthContext.Provider>
    );
};

export default AuthProvider;