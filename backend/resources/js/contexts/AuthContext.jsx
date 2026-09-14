import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API = '/api';

async function api(path, options = {}, token = '') {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || `Request failed (${response.status}).`);
    return body;
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('tidepanel_token') || '');
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!token) { setReady(true); return; }
        api('/auth/me', {}, token).then((body) => setUser(body.user)).catch(() => {
            localStorage.removeItem('tidepanel_token');
            setToken('');
        }).finally(() => setReady(true));
    }, [token]);

    async function login(credentials) {
        const body = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
        if (body.token) {
            localStorage.setItem('tidepanel_token', body.token);
            setToken(body.token);
            setUser(body.user);
        }
        return body;
    }

    async function register(credentials) {
        const body = await api('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
        localStorage.setItem('tidepanel_token', body.token);
        setToken(body.token);
        setUser(body.user);
        return body;
    }

    async function logout() {
        if (token) await api('/auth/logout', { method: 'POST' }, token).catch(() => {});
        localStorage.removeItem('tidepanel_token');
        setToken('');
        setUser(null);
    }

    return <AuthContext.Provider value={{ token, user, ready, login, register, logout, api: (path, options) => api(path, options, token) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
