// Node.js 18+ built-in fetch kullanıyoruz

async function testLoginEndpoint() {
    console.log('🔐 Login Endpoint Test');
    console.log('======================\n');

    try {
        const loginData = {
            email: 'admin@bismilvinc.com',
            password: 'BismilVinc2024!'
        };

        console.log('📧 Login bilgileri:', { 
            email: loginData.email, 
            password: loginData.password ? '***' : 'boş' 
        });

        const response = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        console.log('📊 Response Status:', response.status);
        console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('📊 Response Data:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('✅ Login başarılı!');
            console.log('🔑 Token:', data.token ? '✅ VAR' : '❌ YOK');
            console.log('👤 User:', data.user);
            
            // Token ile stats endpoint'ini test et
            if (data.token) {
                console.log('\n📈 Stats Endpoint Test:');
                const statsResponse = await fetch('http://localhost:3000/api/admin/stats', {
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });
                
                console.log('📊 Stats Response Status:', statsResponse.status);
                const statsData = await statsResponse.json();
                console.log('📊 Stats Response Data:', JSON.stringify(statsData, null, 2));
            }
        } else {
            console.log('❌ Login başarısız!');
            console.log('📝 Message:', data.message);
        }
    } catch (error) {
        console.error('❌ Test hatası:', error);
    }
}

testLoginEndpoint(); 