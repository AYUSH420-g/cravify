import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    
    // Captcha State
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    const { login, googleLogin, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'restaurant_partner') navigate('/vendor/dashboard');
            else if (user.role === 'delivery_partner') navigate('/delivery/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/');
        } else {
            generateCaptcha();
        }
    }, [user, navigate]);

    const generateCaptcha = () => {
        const n1 = Math.floor(Math.random() * 10) + 1;
        const n2 = Math.floor(Math.random() * 10) + 1;
        setNum1(n1);
        setNum2(n2);
        setCaptchaAnswer('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (parseInt(captchaAnswer) !== num1 + num2) {
            setError('Incorrect captcha answer. Please try again.');
            generateCaptcha();
            return;
        }

        const res = await login(formData.email, formData.password);
        if (res.success) {
            // Context will automatically update state, but we can do a hard redirect check if needed.
            const role = res.user.role;
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
            setError(res.message || 'Invalid Credentials');
            generateCaptcha(); // regenerate on failure
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

                    <div className="flex justify-center mt-4">
                        {import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'replace_this_with_your_actual_google_client_id' ? (
                            <GoogleLogin 
                                onSuccess={async (credentialResponse) => {
                                    const res = await googleLogin(credentialResponse.credential);
                                    if (res.success) {
                                        const role = res.user.role;
                                        if (role === 'restaurant_partner') navigate('/vendor/dashboard');
                                        else if (role === 'delivery_partner') navigate('/delivery/dashboard');
                                        else if (role === 'admin') navigate('/admin/dashboard');
                                        else navigate('/');
                                    } else {
                                        setError(res.message);
                                    }
                                }}
                                onError={() => setError('Google Sign In was unsuccessful')}
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
                        <div className="rounded-md shadow-sm space-y-4">
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
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Captcha Block */}
                            <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                <label className="text-gray-700 font-medium text-sm whitespace-nowrap">
                                    Captcha: {num1} + {num2} =
                                </label>
                                <input
                                    type="number"
                                    required
                                    className="appearance-none rounded-lg relative block w-20 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="?"
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-primary hover:text-red-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button variant="primary" className="w-full py-3" type="submit">
                                Sign in
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
};

export default Login;
