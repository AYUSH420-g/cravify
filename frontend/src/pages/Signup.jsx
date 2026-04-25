import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const { register, googleLogin, user } = useAuth();
    const navigate = useNavigate();

    // Redirect logged-in users away from Signup
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isPasswordStrong = (pw) => {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(pw);
    };

    const getPasswordStrength = (pw) => {
        if (!pw) return { label: '', color: '' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
        if (score <= 1) return { label: 'Weak', color: 'text-red-500' };
        if (score <= 2) return { label: 'Fair', color: 'text-orange-500' };
        if (score <= 3) return { label: 'Good', color: 'text-yellow-600' };
        return { label: 'Strong', color: 'text-green-600' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!isPasswordStrong(formData.password)) {
            setError('Password must be at least 8 characters and include an uppercase letter, a number, and a special character.');
            return;
        }

        const res = await register(formData.name, formData.email, formData.password, formData.role);
        
        if (res.success) {
            // Check if partner (waiting for approval)
            if (res.message && res.message.includes('approval')) {
                setSuccessMsg(res.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                navigate('/login');
            }
        } else {
            setError(res.message);
        }
    };

    return (
        <MainLayout>
            <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Create Account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-red-500">
                                sign in to your existing account
                            </Link>
                        </p>
                    </div>

                    <div className="flex justify-center mt-4">
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'replace_this_with_your_actual_google_client_id' ? (
                            <GoogleLogin 
                                onSuccess={async (credentialResponse) => {
                                    const res = await googleLogin(credentialResponse.credential);
                                    if (!res.success) setError(res.message);
                                }}
                                onError={() => setError('Google Sign Up was unsuccessful')}
                            />
                        ) : (
                            <div className="text-center w-full bg-gray-100 border border-gray-200 text-gray-500 py-2 rounded font-medium text-sm">
                                System needs a Google Client ID to enable Google Sign-In.
                            </div>
                        )}
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
                        {successMsg && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{successMsg}<br/>Redirecting to login...</div>}
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Email address"
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
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {formData.password && (
                                    <div className="mt-1.5 flex items-center justify-between">
                                        <p className={`text-xs font-medium ${getPasswordStrength(formData.password).color}`}>
                                            {getPasswordStrength(formData.password).label}
                                        </p>
                                        <p className="text-[10px] text-gray-400">8+ chars, uppercase, number, special char</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Button variant="primary" className="w-full py-3" type="submit">
                                Sign up
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Signup;
