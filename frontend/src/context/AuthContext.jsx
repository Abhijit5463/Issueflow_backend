import { createContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`
        });

        instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401) {
                    if (!originalRequest._retry) {
                        originalRequest._retry = true;
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            try {
                                const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`, {
                                    refreshToken: refreshToken
                                });
                                const { accessToken } = res.data;
                                localStorage.setItem('accessToken', accessToken);
                                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                                return axios(originalRequest);
                            } catch (refreshError) {
                                localStorage.clear();
                                window.location.href = '/login';
                                return Promise.reject(refreshError);
                            }
                        } else {
                            localStorage.clear();
                            window.location.href = '/login';
                            return Promise.reject(error);
                        }
                    } else {
                        // If it's already a retry and still 401, the user is likely gone from DB
                        localStorage.clear();
                        window.location.href = '/login';
                        return Promise.reject(error);
                    }
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const userData = JSON.parse(localStorage.getItem('user'));

            if (accessToken && userData) {
                setUser(userData);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            console.log("Attempting login for:", email);
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`, { email, password });
            console.log("Login response received:", response.data);
            const { token, refreshToken, ...userData } = response.data;

            localStorage.setItem('accessToken', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            console.log("User state updated:", userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (name, email, password) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/signup`, { name, email, password });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        console.log("Logging out...");
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, api, searchTerm, setSearchTerm }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
