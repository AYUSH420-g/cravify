import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const RiderLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(formData.email, formData.password);
        if (res.success) {
            if (res.user.role === 'delivery_partner') {
                navigate('/delivery/dashboard');
            } else {
                setError('This portal is for Delivery Partners only.');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Partner Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Deliver with Cravify and earn more.
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            New here?{' '}
                            <Link to="/delivery/signup" className="font-medium text-primary hover:text-red-600">
                                Apply to be a Rider
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email or Username</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="text"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Email or Username"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Button variant="primary" className="w-full py-3" type="submit">
                                Login to Dashboard
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default RiderLogin;
