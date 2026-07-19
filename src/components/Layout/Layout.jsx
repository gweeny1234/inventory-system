import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    // Redirect to Landing Page instead of Login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="layout">
            {!sidebarOpen && (
                <button
                    className="menu-toggle-btn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    ☰
                </button>
            )}

            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
            />

            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;