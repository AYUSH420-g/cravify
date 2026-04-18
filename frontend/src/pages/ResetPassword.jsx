import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPasswordWithToken, user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
        if (!token) {
            navigate('/login');
        }
    }, [user, navigate, token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match!' });
        }

        if (formData.password.length < 6) {
            return setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        }

        const res = await resetPasswordWithToken(token, formData.password);
        
        if (res.success) {
            setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to reset password. The link might have expired.' });
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Create New Password
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Please type and confirm your new password below.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {message.text && (
                            <div className={`text-sm text-center p-3 rounded ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                {message.text}
                            </div>
                        )}
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="password" className="sr-only">New Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="New Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Confirm New Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Button variant="primary" className="w-full py-3" type="submit">
                                Update Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default ResetPassword;
