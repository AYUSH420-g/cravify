const API_URL = 'http://localhost:5000/api';

async function testAdminFlow() {
    let partnerId;
    let partnerEmail = `partner${Date.now()}@test.com`;

    const request = async (endpoint, method, body, token) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['x-auth-token'] = token;
        
        const res = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json();
        if (!res.ok) throw { response: { data } };
        return { data };
    };

    try {
        console.log('1. Registering as Admin (should fail)');
        try {
            await request('/auth/register', 'POST', {
                name: 'Fake Admin',
                email: `fakeadmin${Date.now()}@test.com`,
                password: 'password',
                role: 'admin'
            });
            console.log('FAIL: Admin registration succeeded');
        } catch (e) {
            console.log('SUCCESS:', e.response.data.message);
        }

        console.log('\n2. Registering as Restaurant Partner (should succeed, marked unverified)');
        const regRes = await request('/auth/register', 'POST', {
            name: 'Test Partner',
            email: partnerEmail,
            password: 'password',
            role: 'restaurant_partner'
        });
        console.log('SUCCESS:', regRes.data.message);
        partnerId = regRes.data.user ? regRes.data.user.id : null;

        console.log('\n3. Logging in as Unverified Partner (should fail)');
        try {
            await request('/auth/login', 'POST', {
                email: partnerEmail,
                password: 'password'
            });
            console.log('FAIL: Unverified partner logged in successfully');
        } catch (e) {
             console.log('SUCCESS:', e.response.data.message);
        }

        console.log('\n4. Login as Admin');
        const adminLogin = await request('/auth/login', 'POST', {
            email: 'admin@cravify.com',
            password: 'admin123'
        });
        const adminToken = adminLogin.data.token;
        console.log('SUCCESS: Admin token received');

        console.log('\n5. Admin fetching pending approvals');
        const pending = await request('/admin/pending-approvals', 'GET', null, adminToken);
        console.log(`SUCCESS: Found ${pending.data.length} pending approvals`);
        
        console.log('\n6. Admin approving partner (if exists)');
        if (partnerId) {
            await request(`/admin/approve/${partnerId}`, 'PUT', null, adminToken);
            console.log('SUCCESS: Partner approved');
        }

        console.log('\n7. Partner logging in again (should succeed now)');
        const partnerLogin = await request('/auth/login', 'POST', {
            email: partnerEmail,
            password: 'password'
        });
        console.log('SUCCESS: Partner token received successfully');

    } catch (e) {
        if (e.response && e.response.data) {
            console.error('Test Failed:', e.response.data.message || e.response.data);
        } else {
            console.error('\n❌ ERROR: Test script failed to connect.');
            console.error('Make sure your backend server is running! (cd backend && npm run dev)', '\nNative Error:', e.cause || e.message);
        }
    }
}

testAdminFlow();
