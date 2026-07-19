import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_products: 0,
        total_stock: 0,
        total_orders: 0,
        reorder_count: 0,
        low_stock_products: [],
        recent_orders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await getDashboardStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-top">
                        <h3>Total Products</h3>
                        <div className="stat-icon">📦</div>
                    </div>
                    <p>{stats.total_products}</p>
                </div>
                
                <div className="stat-card green">
                    <div className="stat-card-top">
                        <h3>Total Stock</h3>
                        <div className="stat-icon">📊</div>
                    </div>
                    <p>{stats.total_stock}</p>
                </div>
                
                <div className="stat-card purple">
                    <div className="stat-card-top">
                        <h3>Total Orders</h3>
                        <div className="stat-icon">🛒</div>
                    </div>
                    <p>{stats.total_orders}</p>
                </div>
                
                <div className="stat-card orange">
                    <div className="stat-card-top">
                        <h3>Reorder Needed</h3>
                        <div className="stat-icon">⚠️</div>
                    </div>
                    <p>{stats.reorder_count}</p>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section">
                    <h2>⚠️ Low Stock Alert</h2>
                    {stats.low_stock_products.length > 0 ? (
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Stock</th>
                                        <th>Reorder Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.low_stock_products.map(product => (
                                        <tr key={product.id}>
                                            <td data-label="Product">{product.name}</td>
                                            <td data-label="Category">{product.category_name || 'N/A'}</td>
                                            <td data-label="Stock" className="stock-low">{product.stock}</td>
                                            <td data-label="Reorder Level">{product.reorder_level}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">All products are well stocked! 👍</p>
                    )}
                </div>

                <div className="section">
                    <h2>📋 Recent Orders</h2>
                    {stats.recent_orders.length > 0 ? (
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order No</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_orders.map(order => (
                                        <tr key={order.id}>
                                            <td data-label="Order No">{order.order_no}</td>
                                            <td data-label="Product">{order.product_name}</td>
                                            <td data-label="Quantity">{order.quantity}</td>
                                            <td data-label="Status">
                                                <span className={`status ${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">No recent orders</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
