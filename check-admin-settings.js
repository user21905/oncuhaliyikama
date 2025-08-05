const fetch = require('node-fetch');

async function checkAdminSettings() {
    console.log('🔍 Admin Settings Kontrolü Başlatılıyor...');
    
    try {
        // Admin panelinde kullanılan settings listesini kontrol et
        const adminSettingsUrl = 'https://bismilvinc.com/admin/app.js';
        const response = await fetch(adminSettingsUrl);
        const text = await response.text();
        
        console.log('📋 Admin app.js içeriği (ilk 1000 karakter):');
        console.log(text.substring(0, 1000));
        
        // Settings key'lerini ara
        const settingsMatch = text.match(/homepage_hero_bg/g);
        console.log('\n🔍 homepage_hero_bg geçişleri:', settingsMatch ? settingsMatch.length : 0);
        
        // Tüm settings key'lerini ara
        const allSettingsMatch = text.match(/['"`]([^'"`]*_bg)['"`]/g);
        console.log('\n🔍 Tüm _bg ile biten key\'ler:', allSettingsMatch);
        
        // Admin panelinde kullanılan settings listesini ara
        const settingsListMatch = text.match(/settingsList\s*=\s*\[([\s\S]*?)\]/);
        if (settingsListMatch) {
            console.log('\n📋 Settings List bulundu:');
            console.log(settingsListMatch[1]);
        }
        
    } catch (error) {
        console.error('❌ Test hatası:', error.message);
    }
}

// Test'i çalıştır
checkAdminSettings().catch(console.error); 