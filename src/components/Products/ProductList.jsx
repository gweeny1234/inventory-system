import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, getSuppliers, createProduct, updateProduct, deleteProduct } from '../../services/api';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        supplier_id: '',
        price: '',
        stock: '',
        date_added: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
                getProducts(),
                getCategories(),
                getSuppliers()
            ]);
            
            if (productsRes.data.success) setProducts(productsRes.data.data);
            if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
            if (suppliersRes.data.success) setSuppliers(suppliersRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct({ ...formData, id: editingProduct.id });
            } else {
                await createProduct(formData);
            }
            fetchData();
            closeModal();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category_id: product.category_id || '',
                supplier_id: product.supplier_id || '',
                price: product.price,
                stock: product.stock,
                date_added: product.date_added || new Date().toISOString().split('T')[0]
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category_id: '',
                supplier_id: '',
                price: '',
                stock: '',
                date_added: new Date().toISOString().split('T')[0]
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading products...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
    <h1>Products</h1>

    <div className="header-actions">
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

                <button className="add-btn" onClick={() => openModal()}>
                    + Add Product
                </button>
            </div>
        </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Supplier</th>
                            <th>Price ($)</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td data-label="ID">{product.id}</td>
                                <td data-label="Product Name">{product.name}</td>
                                <td data-label="Category">{product.category_name || 'N/A'}</td>
                                <td data-label="Supplier">{product.supplier_name || 'N/A'}</td>
                                <td data-label="Price ($)">${parseFloat(product.price).toFixed(2)}</td>
                                <td data-label="Stock" className={product.stock <= 10 ? 'stock-low' : ''}>
                                    {product.stock}
                                </td>
                                <td data-label="Actions">
                                    <button className="edit-btn" onClick={() => openModal(product)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Supplier</label>
                                <select
                                    value={formData.supplier_id}
                                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                                >
                                    <option value="">Select Supplier</option>
                                    {suppliers.map(sup => (
                                        <option key={sup.id} value={sup.id}>{sup.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date Added</label>
                                <input
                                    type="date"
                                    value={formData.date_added}
                                    onChange={(e) => setFormData({...formData, date_added: e.target.value})}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    {editingProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
