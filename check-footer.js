const SettingsRepository = require('./database/repositories/SettingsRepository');
const databaseConnection = require('./database/connection');

async function checkFooter() {
    try {
        await databaseConnection.connect();
        console.log('✅ MongoDB bağlantısı başarılı');
        
        const repo = new SettingsRepository();
        const footerSettings = await repo.getPublicSettingsAsObject();
        
        console.log('\n📋 Footer ayarları:');
        Object.keys(footerSettings)
            .filter(key => key.startsWith('footer_'))
            .forEach(key => {
                console.log(`${key}: ${footerSettings[key]}`);
            });
        
        console.log('\n🔍 Tüm public ayarlar:');
        console.log(Object.keys(footerSettings));
        
        await databaseConnection.disconnect();
        console.log('🔌 MongoDB bağlantısı kapatıldı');
    } catch (error) {
        console.error('❌ Hata:', error);
    }
}

checkFooter(); 