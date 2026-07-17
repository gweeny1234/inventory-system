import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, mobileOpen, closeMobile }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/products', icon: '📦', label: 'Products' },
        { path: '/categories', icon: '🏷️', label: 'Categories' },
        { path: '/orders', icon: '🛒', label: 'Orders' },
        { path: '/suppliers', icon: '🚚', label: 'Suppliers' },
        { path: '/users', icon: '👥', label: 'Users', adminOnly: true },
        { path: '/profile', icon: '👤', label: 'Profile' },
    ];

    const filteredItems = menuItems.filter(item => 
        !item.adminOnly || user?.role === 'admin'
    );

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <h2>Jen's Inventory</h2>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    ☰
                </button>
                <button className="mobile-close-btn" onClick={closeMobile} aria-label="Close menu">
                    ×
                </button>
            </div>
            
            <nav className="sidebar-nav">
                {filteredItems.map(item => (
                    <NavLink 
                        key={item.path} 
                        to={item.path}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        onClick={closeMobile}
                    >
                        <span className="icon">{item.icon}</span>
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
                    🚪 Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
