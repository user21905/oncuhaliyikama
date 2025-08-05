const { spawn } = require('child_process');
const path = require('path');

async function testBackgroundImageSettings() {
    console.log('🧪 Background Image Settings Test Başlatılıyor...');
    
    // Server'ı başlat
    const server = spawn('node', ['server.js'], {
        stdio: 'pipe',
        cwd: __dirname
    });
    
    console.log('⏳ Server başlatılıyor...');
    
    // Server'ın başlamasını bekle
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
        // Settings API'sini test et
        console.log('📡 Settings API test ediliyor...');
        const response = await fetch('http://localhost:3000/api/settings');
        const data = await response.json();
        
        console.log('✅ Settings API Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
            const settings = data.data;
            
            // Background image kontrolü
            if (settings.homepage_hero_bg) {
                console.log('✅ Homepage hero background URL bulundu:', settings.homepage_hero_bg);
                
                // URL'nin geçerli olup olmadığını kontrol et
                try {
                    const imageResponse = await fetch(settings.homepage_hero_bg, { method: 'HEAD' });
                    if (imageResponse.ok) {
                        console.log('✅ Background image URL erişilebilir');
                    } else {
                        console.log('⚠️ Background image URL erişilemiyor (HTTP ' + imageResponse.status + ')');
                    }
                } catch (imageError) {
                    console.log('⚠️ Background image URL kontrol edilemedi:', imageError.message);
                }
            } else {
                console.log('⚠️ Homepage hero background URL bulunamadı');
            }
            
            // Diğer önemli ayarları kontrol et
            console.log('📋 Önemli ayarlar:');
            console.log('- Navbar company name:', settings.navbar_company_name);
            console.log('- Contact phone:', settings.contact_phone);
            console.log('- Contact email:', settings.contact_email);
            console.log('- Service images count:', Object.keys(settings).filter(key => key.startsWith('service_') && key.endsWith('_img')).length);
            
        } else {
            console.log('❌ Settings API başarısız response döndürdü');
        }
        
    } catch (error) {
        console.error('❌ Test hatası:', error.message);
    } finally {
        // Server'ı durdur
        console.log('🛑 Server durduruluyor...');
        server.kill('SIGTERM');
        
        // Server'ın durmasını bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Eğer hala çalışıyorsa zorla durdur
        if (!server.killed) {
            server.kill('SIGKILL');
        }
        
        console.log('✅ Test tamamlandı');
    }
}

// Test'i çalıştır
testBackgroundImageSettings().catch(console.error); 