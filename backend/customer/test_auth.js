const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
    try {
        // 1. Register User
        console.log('Testing Registration...');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'customer'
        });
        console.log('Registration Success:', regRes.data.user.email);
        const token = regRes.data.token;

        // 2. Login User
        console.log('\nTesting Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: regRes.data.user.email,
            password: 'password123'
        });
        console.log('Login Success, Token received');

        // 3. Get Profile (Protected Route)
        console.log('\nTesting Protected Route...');
        const profileRes = await axios.get(`${API_URL}/me`, {
            headers: { 'x-auth-token': token }
        });
        console.log('Profile Retrieved:', profileRes.data.name);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testAuth();
