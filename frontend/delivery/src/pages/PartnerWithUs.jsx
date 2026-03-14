import { Link } from 'react-router-dom';
import StaticPage from '../components/StaticPage';
import Button from '../components/Button';

const PartnerWithUs = () => {
    return (
        <StaticPage title="Partner with Cravify">
            <div className="text-center mb-12">
                <p className="text-xl font-medium text-gray-600">Grow your business with us</p>
                <p className="text-gray-500">Join thousands of restaurants who trust Cravify to deliver their food to hungry customers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Increase Revenue</h3>
                    <p className="text-sm text-gray-500">Reach more customers and get more orders.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Marketing Tools</h3>
                    <p className="text-sm text-gray-500">Promote your brand with our in-app ads.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl text-center">
                    <h3 className="font-bold text-lg mb-2">Easy Management</h3>
                    <p className="text-sm text-gray-500">Manage orders and menus seamlessly.</p>
                </div>
            </div>

            <div className="text-center">
                <Link to="/vendor/signup">
                    <Button variant="primary" size="lg">Register your Restaurant</Button>
                </Link>
            </div>
        </StaticPage>
    );
};

export default PartnerWithUs;
