import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import ProductList from './components/Products/ProductList';
import Categories from './components/Categories/Categories';
import Orders from './components/Orders/Orders';
import Suppliers from './components/Suppliers/Suppliers';
import UserList from './components/Users/UserList';
import Profile from './components/Profile/Profile';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="suppliers" element={<Suppliers />} />
                        <Route path="users" element={<UserList />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
