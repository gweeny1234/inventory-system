import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/api';
import './LoginForm.css';

const LoginForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isLogin) {
            const result = await login({
                email: formData.email,
                password: formData.password
            });
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message || 'Login failed');
            }
        } else {
            await register(formData);
            setIsLogin(true);
            setError('Registration successful! Please sign in.');
        }
    } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>📦 Inventory</h1>
                    <div className="tab-buttons">
                        <button 
                            className={isLogin ? 'active' : ''} 
                            onClick={() => setIsLogin(true)}
                        >
                            Sign In
                        </button>
                        <button 
                            className={!isLogin ? 'active' : ''} 
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>👤 Firstname</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                            <div className="form-group">
                                <label>👤 Lastname</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                        </>
                    )}
                    
                    <div className="form-group">
                        <label>✉️ Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>🔒 Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "Don't have an account? " : "Have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;