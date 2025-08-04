require('dotenv').config();
const fetch = require('node-fetch');

async function testSettingsAPI() {
    console.log('🔧 Settings API Test Başlıyor...');
    
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
    
    // Settings update test
    const testSettings = {
        site_title: 'Test Site Title - ' + new Date().toISOString(),
        site_description: 'Test Site Description - ' + new Date().toISOString(),
        phone_number: '+90 555 123 45 67',
        email_address: 'test@bismilvinc.com',
        address: 'Test Address - ' + new Date().toISOString()
    };
    
    console.log('📋 Test edilecek ayarlar:', testSettings);
    
    const updateResponse = await fetch('http://localhost:3000/api/admin/settings/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testSettings)
    });
    
    const updateData = await updateResponse.json();
    console.log('📡 Settings update response:', updateData);
    
    if (updateData.success) {
        console.log('✅ Settings update başarılı!');
        console.log(`📊 ${updateData.successCount} adet ayar güncellendi`);
    } else {
        console.error('❌ Settings update başarısız!');
        if (updateData.errors) {
            console.error('Hatalar:', updateData.errors);
        }
    }
}

testSettingsAPI().catch(console.error); 