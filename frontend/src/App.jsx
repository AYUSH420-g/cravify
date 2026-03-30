import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
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

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminDeliveryPartners from './pages/AdminDeliveryPartners';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminOffers from './pages/AdminOffers';

// Vendor Pages
import VendorDashboard from './pages/VendorDashboard';
import VendorLogin from './pages/VendorLogin';
import VendorSignup from './pages/VendorSignup';
import VendorMenu from './pages/VendorMenu';
import VendorOrders from './pages/VendorOrders';

// Delivery Pages
import DeliveryDashboard from './pages/DeliveryDashboard';
import DeliveryHistory from './pages/DeliveryHistory';
import DeliveryEarnings from './pages/DeliveryEarnings';
import DeliveryProfile from './pages/DeliveryProfile';
import RiderLogin from './pages/RiderLogin';
import RiderSignup from './pages/RiderSignup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-section font-sans text-dark">
        <Routes>
          {/* ============ Public Customer Routes ============ */}
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
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

          {/* ============ Admin Routes (Protected) ============ */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
          } />
          <Route path="/admin/restaurants" element={
            <ProtectedRoute role="admin"><AdminRestaurants /></ProtectedRoute>
          } />
          <Route path="/admin/delivery-partners" element={
            <ProtectedRoute role="admin"><AdminDeliveryPartners /></ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>
          } />
          <Route path="/admin/offers" element={
            <ProtectedRoute role="admin"><AdminOffers /></ProtectedRoute>
          } />

          {/* ============ Vendor Routes (Protected) ============ */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/signup" element={<VendorSignup />} />
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute role="restaurant_partner"><VendorDashboard /></ProtectedRoute>
          } />
          <Route path="/vendor/menu" element={
            <ProtectedRoute role="restaurant_partner"><VendorMenu /></ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute role="restaurant_partner"><VendorOrders /></ProtectedRoute>
          } />

          {/* ============ Delivery Routes (Protected) ============ */}
          <Route path="/delivery/login" element={<RiderLogin />} />
          <Route path="/delivery/signup" element={<RiderSignup />} />
          <Route path="/delivery/dashboard" element={
            <ProtectedRoute role="delivery_partner"><DeliveryDashboard /></ProtectedRoute>
          } />
          <Route path="/delivery/history" element={
            <ProtectedRoute role="delivery_partner"><DeliveryHistory /></ProtectedRoute>
          } />
          <Route path="/delivery/earnings" element={
            <ProtectedRoute role="delivery_partner"><DeliveryEarnings /></ProtectedRoute>
          } />
          <Route path="/delivery/profile" element={
            <ProtectedRoute role="delivery_partner"><DeliveryProfile /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
