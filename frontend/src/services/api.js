// ==========================================
// Centralized API Service
// All backend API calls go through this module
// Change API_BASE_URL here to switch between local and production
// ==========================================

const API_BASE_URL = 'http://localhost:5005/api';

// ==========================================
// Helper: fetch with auth token
// ==========================================
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {})
    };
};

const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: getAuthHeaders(),
        ...options
    };

    // Merge headers if options.headers is provided
    if (options.headers) {
        config.headers = { ...config.headers, ...options.headers };
    }

    try {
        const res = await fetch(url, config);
        const data = await res.json();

        if (!res.ok) {
            throw { status: res.status, message: data.message || 'Request failed', data };
        }

        return data;
    } catch (err) {
        // If it's a network error (backend not running)
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
            throw { status: 0, message: 'Cannot connect to server. Is the backend running?' };
        }
        throw err;
    }
};

// ==========================================
// Auth APIs
// ==========================================
export const authAPI = {
    login: (email, password) =>
        fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    register: (name, email, password, role = 'customer') =>
        fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        }),

    getProfile: () => fetchAPI('/auth/me')
};

// ==========================================
// Admin APIs
// ==========================================
export const adminAPI = {
    // Dashboard
    getStats: () => fetchAPI('/admin/stats'),

    // Users
    getUsers: () => fetchAPI('/admin/users'),
    toggleUserStatus: (id, status) =>
        fetchAPI(`/admin/users/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),

    // Restaurants
    getRestaurants: () => fetchAPI('/admin/restaurants'),
    updateRestaurantStatus: (id, applicationStatus) =>
        fetchAPI(`/admin/restaurants/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ applicationStatus })
        }),

    // Delivery Partners
    getDeliveryPartners: () => fetchAPI('/admin/delivery-partners'),
    updateDeliveryPartnerStatus: (id, applicationStatus) =>
        fetchAPI(`/admin/delivery-partners/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ applicationStatus })
        }),

    // Orders
    getOrders: () => fetchAPI('/admin/orders'),
    cancelOrder: (id) =>
        fetchAPI(`/admin/orders/${id}/cancel`, { method: 'PUT' }),

    // Settings
    getSettings: () => fetchAPI('/admin/settings'),
    updateSettings: (settings) =>
        fetchAPI('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        }),

    // Promos
    getPromos: () => fetchAPI('/admin/promos'),
    createPromo: (promoData) =>
        fetchAPI('/admin/promos', {
            method: 'POST',
            body: JSON.stringify(promoData)
        }),
    togglePromo: (id) =>
        fetchAPI(`/admin/promos/${id}/toggle`, { method: 'PUT' }),
    deletePromo: (id) =>
        fetchAPI(`/admin/promos/${id}`, { method: 'DELETE' })
};

// ==========================================
// Customer APIs
// ==========================================
export const customerAPI = {
    getRestaurants: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchAPI(`/customer/restaurants${query ? '?' + query : ''}`);
    },
    getRestaurantById: (id) => fetchAPI(`/customer/restaurants/${id}`),
    placeOrder: (orderData) =>
        fetchAPI('/customer/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        }),
    getOrders: () => fetchAPI('/customer/orders'),
    getOrderById: (id) => fetchAPI(`/customer/orders/${id}`),
    updateProfile: (profileData) =>
        fetchAPI('/customer/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        })
};

// ==========================================
// Vendor APIs
// ==========================================
export const vendorAPI = {
    getProfile: () => fetchAPI('/vendor/profile'),
    updateProfile: (data) =>
        fetchAPI('/vendor/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    getMenu: () => fetchAPI('/vendor/menu'),
    addMenuItem: (item) =>
        fetchAPI('/vendor/menu', {
            method: 'POST',
            body: JSON.stringify(item)
        }),
    updateMenuItem: (itemId, item) =>
        fetchAPI(`/vendor/menu/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(item)
        }),
    deleteMenuItem: (itemId) =>
        fetchAPI(`/vendor/menu/${itemId}`, { method: 'DELETE' }),
    getOrders: () => fetchAPI('/vendor/orders'),
    updateOrderStatus: (id, status) =>
        fetchAPI(`/vendor/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        })
};

// ==========================================
// Delivery APIs
// ==========================================
export const deliveryAPI = {
    getProfile: () => fetchAPI('/delivery/profile'),
    toggleOnline: () =>
        fetchAPI('/delivery/profile/status', { method: 'PUT' }),
    getAvailableTasks: () => fetchAPI('/delivery/tasks/available'),
    getActiveTask: () => fetchAPI('/delivery/tasks/active'),
    acceptTask: (taskId) =>
        fetchAPI(`/delivery/tasks/${taskId}/accept`, { method: 'PUT' }),
    updateTaskStatus: (taskId, status) =>
        fetchAPI(`/delivery/tasks/${taskId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
    getHistory: () => fetchAPI('/delivery/history')
};

// Export the base URL for reference
export { API_BASE_URL };
export default fetchAPI;
