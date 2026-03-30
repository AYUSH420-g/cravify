import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Wraps pages that require authentication and/or a specific role.
 * 
 * Usage:
 *   <ProtectedRoute role="admin">
 *       <AdminDashboard />
 *   </ProtectedRoute>
 * 
 * Props:
 *   - role (string, optional): Required user role to access this route.
 *                               If not specified, any logged-in user can access.
 *   - children: The page component to render if authorized.
 */
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    // Show nothing while auth state is loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not logged in → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role mismatch → redirect to appropriate dashboard
    if (role && user.role !== role) {
        const dashboardMap = {
            admin: '/admin/dashboard',
            restaurant_partner: '/vendor/dashboard',
            delivery_partner: '/delivery/dashboard',
            customer: '/'
        };
        return <Navigate to={dashboardMap[user.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
