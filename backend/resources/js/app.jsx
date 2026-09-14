import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import React from 'react';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AdminDashboard from './Pages/AdminDashboard';
import AdminDeploy from './Pages/AdminDeploy';
import Servers from './Pages/Servers';
import AccountSettings from './Pages/AccountSettings';
import { AuthProvider } from './contexts/AuthContext';

class RuntimeErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return <div style={{ minHeight: '100vh', padding: '2rem', color: '#fff', background: '#071426', fontFamily: 'system-ui' }}><h1>TidePanel failed to render</h1><p>{this.state.error.message}</p></div>;
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} · Strike Panel`,
    resolve: (name) => {
        if (name === 'Dashboard') return Promise.resolve(Dashboard);
        if (name === 'Login') return Promise.resolve(Login);
        if (name === 'Register') return Promise.resolve(Register);
        if (name === 'AdminDashboard') return Promise.resolve(AdminDashboard);
        if (name === 'AdminDeploy') return Promise.resolve(AdminDeploy);
        if (name === 'Servers') return Promise.resolve(Servers);
        if (name === 'AccountSettings') return Promise.resolve(AccountSettings);
        return Promise.reject(new Error(`Unknown Inertia page: ${name}`));
    },
    setup({ el, App, props }) {
        createRoot(el).render(<RuntimeErrorBoundary><AuthProvider><App {...props} /></AuthProvider></RuntimeErrorBoundary>);
    },
}).catch((error) => {
    const el = document.getElementById('app');
    if (el) el.innerHTML = `<div style="padding:2rem;color:#fff;background:#071426;font-family:system-ui"><h1>TidePanel failed to load</h1><p>${error instanceof Error ? error.message : 'Unknown client error'}</p></div>`;
    console.error(error);
});
