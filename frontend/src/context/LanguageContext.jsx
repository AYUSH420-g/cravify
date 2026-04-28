import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        welcome: "Welcome to Cravify",
        search_placeholder: "Search for food, restaurants...",
        orders: "My Orders",
        profile: "Profile",
        wallet: "Wallet",
        settings: "Settings",
        logout: "Logout",
        explore: "Explore Restaurants",
        surprise_me: "Surprise Me",
        no_cutlery: "No Cutlery (Save Plastic)",
        tip_rider: "Tip your rider",
        place_order: "Place Order",
        wallet_history: "Wallet History",
        refer_friend: "Refer a Friend",
        theme: "Theme",
        language: "Language",
        dark_mode: "Dark Mode",
        light_mode: "Light Mode",
        history: "History"
    },
    hi: {
        welcome: "Cravify में आपका स्वागत है",
        search_placeholder: "खाना, रेस्टोरेंट खोजें...",
        orders: "मेरे ऑर्डर",
        profile: "प्रोफ़ाइल",
        wallet: "वॉलेट",
        settings: "सेटिंग्स",
        logout: "लॉगआउट",
        explore: "रेस्टोरेंट खोजें",
        surprise_me: "मुझे सरप्राइज दें",
        no_cutlery: "कटलरी नहीं चाहिए (प्लास्टिक बचाएं)",
        tip_rider: "राइडर को टिप दें",
        place_order: "ऑर्डर दें",
        wallet_history: "वॉलेट इतिहास",
        refer_friend: "दोस्त को रेफर करें",
        theme: "थीम",
        language: "भाषा",
        dark_mode: "डार्क मोड",
        light_mode: "लाइट मोड",
        history: "इतिहास"
    }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('cravify-lang') || 'en';
    });

    useEffect(() => {
        const savedLang = localStorage.getItem('cravify-lang');
        
        // If language changed, handle the transition
        if (savedLang && savedLang !== language) {
            localStorage.setItem('cravify-lang', language);
            
            if (language === 'en') {
                // CLEAR Google Translate cookies to restore native English
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=localhost; path=/;';
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.localhost; path=/;';
            } else {
                // Set the cookie for the selected language
                const cookieValue = `googtrans=/en/${language}`;
                document.cookie = `${cookieValue}; path=/`;
                document.cookie = `${cookieValue}; domain=localhost; path=/`;
                document.cookie = `${cookieValue}; domain=.localhost; path=/`;
            }
            
            // Reload once to apply the change
            setTimeout(() => {
                window.location.reload();
            }, 100);
        } else {
            localStorage.setItem('cravify-lang', language);
            
            // If we are in English, ensure the cookie is gone
            if (language === 'en') {
                const currentCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
                if (currentCookie) {
                    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    window.location.reload();
                }
            }
        }
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
