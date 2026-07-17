import React, { useState, useEffect } from 'react';
import { getOrders, getProducts, createOrder, updateOrder, deleteOrder } from '../../services/api';
import '../Products/ProductList.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: '',
        status: 'pending',
        order_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                getOrders(),
                getProducts()
            ]);
            if (ordersRes.data.success) setOrders(ordersRes.data.data);
            if (productsRes.data.success) setProducts(productsRes.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingOrder) {
                const product = products.find(p => p.id === parseInt(formData.product_id));
                await updateOrder({
                    ...formData,
                    id: editingOrder.id,
                    total_price: product ? product.price * formData.quantity : 0
                });
            } else {
                await createOrder(formData);
            }
            fetchData();
            closeModal();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save order');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this order?')) {
            try {
                await deleteOrder(id);
                fetchData();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const openModal = (order = null) => {
        if (order) {
            setEditingOrder(order);
            setFormData({
                product_id: order.product_id || '',
                quantity: order.quantity,
                status: order.status,
                order_date: order.order_date || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingOrder(null);
            setFormData({
                product_id: '',
                quantity: '',
                status: 'pending',
                order_date: new Date().toISOString().split('T')[0]
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOrder(null);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>🛒 Orders</h1>
                <button className="add-btn" onClick={() => openModal()}>+ New Order</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Order No</th>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Total Price</th>
                            <th>Status</th>
                            <th>Date</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td data-label="Order No">{order.order_no}</td>
                                <td data-label="Product">{order.product_name || 'N/A'}</td>
                                <td data-label="Category">{order.category_name || 'N/A'}</td>
                                <td data-label="Quantity">{order.quantity}</td>
                                <td data-label="Total Price">${parseFloat(order.total_price).toFixed(2)}</td>
                                <td data-label="Status">
                                    <span className={`status ${order.status}`}>{order.status}</span>
                                </td>
                                <td data-label="Date">{order.order_date}</td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingOrder ? 'Edit Order' : 'New Order'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                                    required
                                    disabled={!!editingOrder}
                                >
                                    <option value="">Select Product</option>
                                    {products.map(prod => (
                                        <option key={prod.id} value={prod.id}>
                                            {prod.name} - ${prod.price} (Stock: {prod.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    required
                                />
                            </div>
                            {editingOrder && (
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Order Date</label>
                                <input
                                    type="date"
                                    value={formData.order_date}
                                    onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="save-btn">
                                    {editingOrder ? 'Save Changes' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
