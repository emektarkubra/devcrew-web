import React, { useEffect, useState, createContext } from 'react';
import { api } from '../services';
import { Spin } from 'antd';
import toast from 'react-hot-toast';

export type AuthContextProps = {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    logout: () => void;
    loading: boolean
};

export const AuthContext = createContext<AuthContextProps>({
    user: null,
    token: null,
    isAuthenticated: false,
    logout: () => { },
    loading: false

});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('dt-token'));
    const [loading, setLoading] = useState<boolean>(true);



    const getNewToken = () => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (token) {
            localStorage.setItem('dt-token', token)
            window.history.replaceState({}, '', '/overview')
            setToken(token)
        }
    }


    const getUserProfile = async () => {
        if (!token) {
            setLoading(false);
            return;
        } else {
            try {
                const { data, error } = await api.profile.getUserProfile(token)
                if (error) {
                    toast.error(error)
                } else {
                    setUser(data)
                    setLoading(false)
                }
            } catch (error) {
                localStorage.removeItem('dt-token');
                setToken(null);

            } finally {
                setLoading(false);
            }
        }

    }

    useEffect(() => {
        getNewToken()
    }, []);

    useEffect(() => {
        getUserProfile()
    }, [token]);



    const logout = () => {
        localStorage.removeItem('dt-token')
        window.location.href = '/'
        setUser(null);
        setToken(null);
        localStorage.removeItem('dt-token')
        window.location.href = '/'
    };


    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, loading, logout }}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Spin size="large" />
                </div>
            ) : children}
        </AuthContext.Provider>
    )
};

export default AuthProvider;