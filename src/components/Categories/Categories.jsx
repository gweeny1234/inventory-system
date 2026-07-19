import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import '../Products/ProductList.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         if (editingCategory) {
    //             await updateCategory({ ...formData, id: editingCategory.id });
    //         } else {
    //             await createCategory(formData);
    //         }
    //         fetchCategories();
    //         closeModal();
    //     } catch (error) {
    //         alert('Failed to save category');
    //     }
    // };


    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (editingCategory) {
            const response = await updateCategory({
                ...formData,
                id: editingCategory.id,
            });

            console.log(response.data);
        } else {
            const response = await createCategory(formData);

            console.log(response.data);
        }

        fetchCategories();
        closeModal();
    } catch (error) {
        console.error(error);

        if (error.response) {
            console.log(error.response.data);
            alert(JSON.stringify(error.response.data));
        } else {
            alert(error.message);
        }
    }
};

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="products-page">
            <div className="page-header">
    <h1>Categories</h1>

            <div className="header-actions">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="add-btn" onClick={() => openModal()}>
                    + Add Category
                </button>
                </div>
             </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Products</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map(cat => (
                            <tr key={cat.id}>
                                <td data-label="ID">{cat.id}</td>
                                <td data-label="Name">{cat.name}</td>
                                <td data-label="Description">{cat.description || '-'}</td>
                                <td data-label="Products">{cat.product_count || 0}</td>
                                <td data-label="Actions">
                                    <button className="edit-btn" onClick={() => openModal(cat)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(cat.id)}>Delete</button>
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
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="save-btn">
                                    {editingCategory ? 'Save Changes' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
