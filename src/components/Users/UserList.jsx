import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/api';
import '../Products/ProductList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        role: 'staff'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            if (response.data.success) setUsers(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser({ ...formData, id: editingUser.id });
            fetchUsers();
            closeModal();
        } catch (error) {
            alert('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            try {
                await deleteUser(id);
                fetchUsers();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const openModal = (user) => {
        setEditingUser(user);
        setFormData({
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
                <h1>👥 User Management</h1>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.firstname} {user.lastname}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status ${user.role}`}>{user.role}</span>
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => openModal(user)}>✏️</button>
                                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑️</button>
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
                            <h2>Edit User</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="staff">Staff</option>
                                    <option value="customer">Customer</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
