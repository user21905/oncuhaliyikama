require('dotenv').config();
const fetch = require('node-fetch');

async function testServicesAPI() {
    console.log('🔧 Services API Test Başlıyor...');
    
    // Önce login ol
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'admin@bismilvinc.com',
            password: 'BismilVinc2024!'
        })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login response:', loginData);
    
    if (!loginData.success) {
        console.error('❌ Login başarısız');
        return;
    }
    
    const token = loginData.token;
    console.log('✅ Login başarılı, token alındı');
    
    // Services listesi test
    console.log('📋 Services listesi alınıyor...');
    
    const servicesResponse = await fetch('http://localhost:3000/api/admin/services', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('📡 Services response status:', servicesResponse.status);
    
    if (servicesResponse.ok) {
        const services = await servicesResponse.json();
        console.log('✅ Services listesi başarıyla alındı');
        console.log(`📊 Toplam ${services.length} adet hizmet bulundu`);
        
        if (services.length > 0) {
            console.log('📋 Hizmetler:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ID: ${service.id}, Title: ${service.title}, Slug: ${service.slug}`);
            });
        } else {
            console.log('⚠️ Hiç hizmet bulunamadı');
        }
    } else {
        const errorText = await servicesResponse.text();
        console.error('❌ Services listesi alınamadı');
        console.error('Error response:', errorText);
    }
}

testServicesAPI().catch(console.error); 