import React, { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/api';
import '../Products/ProductList.css';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await getSuppliers();
            if (response.data.success) setSuppliers(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await updateSupplier({ ...formData, id: editingSupplier.id });
            } else {
                await createSupplier(formData);
            }
            fetchSuppliers();
            closeModal();
        } catch (error) {
            alert('Failed to save supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            try {
                await deleteSupplier(id);
                fetchSuppliers();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const openModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contact_person: supplier.contact_person || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSupplier(null);
    };

    const filteredSuppliers = suppliers.filter(sup =>
        sup.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>🚚 Suppliers</h1>
                <button className="add-btn" onClick={() => openModal()}>+ Add Supplier</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map(sup => (
                            <tr key={sup.id}>
                                <td data-label="ID">{sup.id}</td>
                                <td data-label="Name">{sup.name}</td>
                                <td data-label="Contact Person">{sup.contact_person || '-'}</td>
                                <td data-label="Email">{sup.email || '-'}</td>
                                <td data-label="Phone">{sup.phone || '-'}</td>
                                <td data-label="Products">{sup.product_count || 0}</td>
                                <td data-label="Actions">
                                    <button className="edit-btn" onClick={() => openModal(sup)}>✏️</button>
                                    <button className="delete-btn" onClick={() => handleDelete(sup.id)}>🗑️</button>
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
                            <h2>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Supplier Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input
                                    type="text"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    rows="2"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="save-btn">
                                    {editingSupplier ? 'Save Changes' : 'Add Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
