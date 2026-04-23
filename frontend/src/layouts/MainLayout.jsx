import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LiveOrderPopup from '../components/LiveOrderPopup';

const MainLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <LiveOrderPopup />
            <Footer />
        </div>
    );
};

export default MainLayout;
