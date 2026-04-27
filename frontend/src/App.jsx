import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import Search from './pages/Search';
import Offers from './pages/Offers';
import Help from './pages/Help';
import About from './pages/About';
import Team from './pages/Team';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import PartnerWithUs from './pages/PartnerWithUs';
import RideWithUs from './pages/RideWithUs';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Privacy from './pages/Privacy';
import Cookie from './pages/Cookie';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminRestaurantView from './pages/AdminRestaurantView';
import AdminDeliveryPartners from './pages/AdminDeliveryPartners';
import AdminDeliveryPartnerView from './pages/AdminDeliveryPartnerView';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminFinancials from './pages/AdminFinancials';
import VendorDashboard from './pages/VendorDashboard';
import VendorLogin from './pages/VendorLogin';
import VendorSignup from './pages/VendorSignup';
import VendorMenu from './pages/VendorMenu';
import VendorOrders from './pages/VendorOrders';
import VendorHistory from './pages/VendorHistory';
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryHistory from './pages/DeliveryHistory';
import RiderLogin from './pages/RiderLogin';
import RiderSignup from './pages/RiderSignup';

import DeliveryEarnings from './pages/DeliveryEarnings';
import DeliveryProfile from './pages/DeliveryProfile';
import LoyaltyPage from './pages/LoyaltyPage';

import { SettingsProvider } from './context/SettingsContext';
import { GlobalBroadcastBanner, MaintenanceOverlay } from './components/SystemAlerts';
import LiveOrderPopup from './components/LiveOrderPopup';
import { useAuth, AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Route guard components
const ProtectedRoute = ({ children, allowedRoles, fallbackPath }) => {
    const { user, token } = useAuth();
    if (!token || !user) {
        return <Navigate to={fallbackPath || '/login'} replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <Router>
            <div className="min-h-screen bg-background font-sans text-text-main flex flex-col">
              <MaintenanceOverlay />
              <GlobalBroadcastBanner />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/loyalty" element={<LoyaltyPage />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/partner" element={<PartnerWithUs />} />
                  <Route path="/ride" element={<RideWithUs />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund" element={<Refund />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookie" element={<Cookie />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Admin Routes — Protected */}
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin/restaurants" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminRestaurants /></ProtectedRoute>} />
                  <Route path="/admin/restaurants/:id" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminRestaurantView /></ProtectedRoute>} />
                  <Route path="/admin/delivery-partners" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminDeliveryPartners /></ProtectedRoute>} />
                  <Route path="/admin/delivery-partners/:id" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminDeliveryPartnerView /></ProtectedRoute>} />
                  <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminOrders /></ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminSettings /></ProtectedRoute>} />
                  <Route path="/admin/financials" element={<ProtectedRoute allowedRoles={['admin']} fallbackPath="/login"><AdminFinancials /></ProtectedRoute>} />

                  {/* Vendor Routes — Protected */}
                  <Route path="/vendor/login" element={<VendorLogin />} />
                  <Route path="/vendor/signup" element={<VendorSignup />} />
                  <Route path="/vendor/dashboard" element={<ProtectedRoute allowedRoles={['restaurant_partner']} fallbackPath="/vendor/login"><VendorDashboard /></ProtectedRoute>} />
                  <Route path="/vendor/menu" element={<ProtectedRoute allowedRoles={['restaurant_partner']} fallbackPath="/vendor/login"><VendorMenu /></ProtectedRoute>} />
                  <Route path="/vendor/orders" element={<ProtectedRoute allowedRoles={['restaurant_partner']} fallbackPath="/vendor/login"><VendorOrders /></ProtectedRoute>} />
                  <Route path="/vendor/history" element={<ProtectedRoute allowedRoles={['restaurant_partner']} fallbackPath="/vendor/login"><VendorHistory /></ProtectedRoute>} />

                  {/* Delivery Routes — Protected */}
                  <Route path="/delivery/login" element={<RiderLogin />} />
                  <Route path="/delivery/signup" element={<RiderSignup />} />
                  <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['delivery_partner']} fallbackPath="/delivery/login"><DeliveryDashboard /></ProtectedRoute>} />
                  <Route path="/delivery/history" element={<ProtectedRoute allowedRoles={['delivery_partner']} fallbackPath="/delivery/login"><DeliveryHistory /></ProtectedRoute>} />
                  <Route path="/delivery/earnings" element={<ProtectedRoute allowedRoles={['delivery_partner']} fallbackPath="/delivery/login"><DeliveryEarnings /></ProtectedRoute>} />
                  <Route path="/delivery/profile" element={<ProtectedRoute allowedRoles={['delivery_partner']} fallbackPath="/delivery/login"><DeliveryProfile /></ProtectedRoute>} />
                </Routes>
              </div>

              {/* Global live order tracking popup for customers */}
              <LiveOrderPopup />
            </div>
          </Router>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
