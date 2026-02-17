import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/check');
                if (response.data.isAuthenticated) {
                    setAuth({
                        user: response.data.user,
                        isAuthenticated: true,
                        loading: false,
                    });
                } else {
                    setAuth({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                    });
                }
            } catch (error) {
                console.error("Auth check failed", error);
                setAuth({
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                });
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        setAuth({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
        });
        return response.data;
    };

    const register = async (name, email, password) => {
        return await api.post('/auth/register', { name, email, password });
    };

    const verifyOtp = async (email, otp) => {
        return await api.post('/auth/verify-otp', { email, otp });
    }

    const logout = async () => {
        await api.get('/auth/logout');
        setAuth({
            user: null,
            isAuthenticated: false,
            loading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, register, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
