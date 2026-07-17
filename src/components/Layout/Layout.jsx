import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="layout">
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
            >
                ☰
            </button>

            {mobileOpen && (
                <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                mobileOpen={mobileOpen}
                closeMobile={() => setMobileOpen(false)}
            />
            <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
