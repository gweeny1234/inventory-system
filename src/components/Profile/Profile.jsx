import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../services/api';
import '../Products/ProductList.css';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        email: user?.email || '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = { ...formData, id: user.id };
            if (!formData.password) delete dataToSend.password;
            
            const response = await updateUser(dataToSend);
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setFormData({ ...formData, password: '' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
    };

    return (
        <div className="profile-page">
            <h1>User Profile</h1>
            
            <div className="profile-card">
                <div className="profile-header">
                    <div className="avatar">
                        {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <h2>{user?.firstname} {user?.lastname}</h2>
                        <span className={`role-badge ${user?.role}`}>{user?.role}</span>
                    </div>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>{message.text}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={formData.firstname}
                                onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={formData.lastname}
                                onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password (leave blank to keep current)</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Enter new password"
                        />
                    </div>
                    <button type="submit" className="save-btn">Update Profile</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
