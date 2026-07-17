import axios from 'axios';

// const API_URL = "http://localhost/inventory-backend/api";
const API_URL = "https://storeinventorysystem.infinityfreeapp.com/inventory-backend/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Auth
export const login = (credentials) => api.post('/auth/login.php', credentials);
export const register = (userData) => api.post('/auth/register.php', userData);
export const logout = () => api.post('/auth/logout.php');

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats.php');

// Products
export const getProducts = () => api.get('/products/index.php');
export const getProduct = (id) => api.get(`/products/read_single.php?id=${id}`);
export const createProduct = (data) => api.post('/products/create.php', data);
export const updateProduct = (data) => api.post('/products/update.php', data);
export const deleteProduct = (id) => api.post('/products/delete.php', { id });

// Categories
export const getCategories = () => api.get('/categories/index.php');
export const createCategory = (data) => api.post('/categories/create.php', data);
export const updateCategory = (data) => api.post('/categories/update.php', data);
export const deleteCategory = (id) => api.post('/categories/delete.php', { id });

// Suppliers
export const getSuppliers = () => api.get('/suppliers/index.php');
export const createSupplier = (data) => api.post('/suppliers/create.php', data);
export const updateSupplier = (data) => api.post('/suppliers/update.php', data);
export const deleteSupplier = (id) => api.post('/suppliers/delete.php', { id });

// Orders
export const getOrders = () => api.get('/orders/index.php');
export const createOrder = (data) => api.post('/orders/create.php', data);
export const updateOrder = (data) => api.post('/orders/update.php', data);
export const deleteOrder = (id) => api.post('/orders/delete.php', { id });

// Users
export const getUsers = () => api.get('/users/index.php');
export const getUser = (id) => api.get(`/users/read_single.php?id=${id}`);
export const updateUser = (data) => api.post('/users/update.php', data);
export const deleteUser = (id) => api.post('/users/delete.php', { id });

export default api;
