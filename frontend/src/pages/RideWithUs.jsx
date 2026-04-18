import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StaticPage from '../components/StaticPage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const RideWithUs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.role === 'delivery_partner') {
            navigate('/delivery/dashboard');
        }
    }, [user, navigate]);

    return (
        <StaticPage title="Ride with Cravify">
            <div className="text-center mb-12">
                <p className="text-xl font-medium text-gray-600">Earn money on your own schedule</p>
                <p className="text-gray-500">Become a delivery partner and start earning today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Flexible Hours</h3>
                    <p className="text-sm text-gray-500">Work whenever you want, as much as you want.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Weekly Payments</h3>
                    <p className="text-sm text-gray-500">Get paid directly to your bank account every week.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Insurance Support</h3>
                    <p className="text-sm text-gray-500">We prioritize your safety with our insurance coverage.</p>
                </div>
            </div>

            <div className="text-center">
                <Link to="/delivery/signup">
                    <Button variant="primary" size="lg">Join as Delivery Partner</Button>
                </Link>
            </div>
        </StaticPage>
    );
};

export default RideWithUs;
