import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/products', label: 'Products' },
        { path: '/categories', label: 'Categories' },
        { path: '/orders', label: 'Orders' },
        { path: '/suppliers', label: 'Suppliers' },
        { path: '/users', label: 'Users', adminOnly: true },
        { path: '/profile', label: 'Profile' },
    ];

    const filteredItems = menuItems.filter(item =>
        !item.adminOnly || user?.role === 'admin'
    );

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2>Jen's Inventory</h2>
                <button className="close-btn" onClick={closeSidebar} aria-label="Close menu">
                    ×
                </button>
            </div>

            <nav className="sidebar-nav">
                {filteredItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        onClick={closeSidebar}
                    >
                        <span className="label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <span>{user?.firstname} {user?.lastname}</span>
                    <small>{user?.role}</small>
                </div>
                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
