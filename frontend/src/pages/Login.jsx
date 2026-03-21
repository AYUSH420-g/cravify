import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5005/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // ✅ Save user (optional)
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                const role = data.user.role;

                if (role === 'restaurant_partner') {
                    navigate('/vendor/dashboard');
                } else if (role === 'delivery_partner') {
                    navigate('/delivery/dashboard');
                } else if (role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }

            } else {
                setError(data.message || 'Invalid credentials');
            }

        } catch (err) {
            console.error(err);
            setError('Server error. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link to="/signup" className="font-medium text-primary hover:text-red-500">
                                create a new account
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">

                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-xl"
                            />

                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border rounded-xl"
                            />

                        </div>

                        <Button
                            variant="primary"
                            className="w-full py-3"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>

                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Login;