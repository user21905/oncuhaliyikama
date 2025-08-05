const { spawn } = require('child_process');

async function testSettingsAPI() {
    console.log('🔍 Settings API test başlıyor...');
    
    // Test URLs
    const testUrls = [
        'https://bismilvinc.com/api/settings',
        'https://www.bismilvinc.com/api/settings'
    ];
    
    for (const url of testUrls) {
        console.log(`\n📡 Testing: ${url}`);
        
        try {
            const response = await fetch(url);
            console.log(`Status: ${response.status}`);
            console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Response data:', JSON.stringify(data, null, 2));
                
                if (data.success && data.data) {
                    const settings = data.data;
                    console.log('📋 Settings keys:', Object.keys(settings));
                    
                    if (settings.homepage_hero_bg) {
                        console.log('🎯 homepage_hero_bg bulundu:', settings.homepage_hero_bg);
                        
                        // Test if image is accessible
                        try {
                            const imgResponse = await fetch(settings.homepage_hero_bg);
                            console.log(`🖼️ Image status: ${imgResponse.status}`);
                            console.log(`🖼️ Image accessible: ${imgResponse.ok}`);
                        } catch (imgError) {
                            console.error('❌ Image fetch error:', imgError.message);
                        }
                    } else {
                        console.log('⚠️ homepage_hero_bg bulunamadı!');
                        console.log('Mevcut settings:', settings);
                    }
                } else {
                    console.log('❌ Data structure beklenmiyor:', data);
                }
            } else {
                console.log('❌ API error:', response.status, response.statusText);
                const errorText = await response.text();
                console.log('Error body:', errorText);
            }
        } catch (error) {
            console.error('❌ Fetch error:', error.message);
        }
    }
}

// Test'i çalıştır
testSettingsAPI().then(() => {
    console.log('\n✅ Test tamamlandı');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test hatası:', error);
    process.exit(1);
}); 