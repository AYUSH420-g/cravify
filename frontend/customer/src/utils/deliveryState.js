// frontend/src/utils/deliveryState.js

export const getDeliveryStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const statsStr = localStorage.getItem('cravify_delivery_stats');
    
    // Default initial mock stats (so the UI looks good initially)
    let stats = {
        lastActiveDate: today,
        todaysEarnings: 0,
        ordersCount: 0,
        rideTimeMinutes: 0,
        totalEarnings: 5240.50,
        totalDeliveries: 42,
        totalTips: 450,
        totalRideTimeMinutes: 28 * 60, // 28 hours
        pastDeliveries: []
    };

    if (statsStr) {
        const parsed = JSON.parse(statsStr);
        stats = { ...stats, ...parsed }; // Merge to preserve defaults if properties are missing
        if (!stats.pastDeliveries) stats.pastDeliveries = [];
    }

    // Daily reset check
    if (stats.lastActiveDate !== today) {
        // Roll over daily to total (roughly)
        stats.totalEarnings += stats.todaysEarnings;
        stats.totalDeliveries += stats.ordersCount;
        stats.totalRideTimeMinutes += stats.rideTimeMinutes;

        // Reset daily stats
        stats.todaysEarnings = 0;
        stats.ordersCount = 0;
        stats.rideTimeMinutes = 0;
        stats.pastDeliveries = [];
        stats.lastActiveDate = today;
        saveDeliveryStats(stats);
    }

    return stats;
};

export const saveDeliveryStats = (stats) => {
    localStorage.setItem('cravify_delivery_stats', JSON.stringify(stats));
};

export const formatRideTime = (minutes) => {
    if (!minutes) return "0m";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
};
