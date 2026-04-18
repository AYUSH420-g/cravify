import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const { forgotPassword, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const res = await forgotPassword(email);
        
        if (res.success) {
            setMessage({ type: 'success', text: 'If an account with that email exists, we have sent a reset link.' });
            setEmail('');
        } else {
            setMessage({ type: 'error', text: res.message || 'Failed to send reset email.' });
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Forgot Password
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Remember your password?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-red-500">
                                Sign in here
                            </Link>
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
                                <label htmlFor="email-address" className="sr-only">Registered Email</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Button variant="primary" className="w-full py-3" type="submit">
                                Send Reset Link
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default ForgotPassword;
