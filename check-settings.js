require('dotenv').config();
const supabaseConnection = require('./database/supabase-connection');

async function checkSettings() {
    console.log('🔍 Supabase Settings Kontrolü Başlıyor...');
    
    try {
        const client = await supabaseConnection.connect();
        console.log('✅ Supabase bağlantısı başarılı');
        
        // Tüm settings'leri al
        const { data, error } = await client
            .from('settings')
            .select('*')
            .order('key');
        
        if (error) {
            console.error('❌ Settings sorgu hatası:', error);
            return;
        }
        
        console.log(`📊 Toplam ${data.length} adet setting bulundu:`);
        
        if (data.length > 0) {
            data.forEach((setting, index) => {
                console.log(`  ${index + 1}. Key: "${setting.key}" = "${setting.value}"`);
            });
        } else {
            console.log('⚠️ Hiç setting bulunamadı!');
        }
        
        // Beklenen key'leri kontrol et
        const expectedKeys = [
            'site_title',
            'site_description', 
            'phone_number',
            'email_address',
            'address',
            'whatsapp_number',
            'working_hours',
            'map_latitude',
            'map_longitude'
        ];
        
        console.log('\n🔍 Beklenen key\'ler kontrol ediliyor...');
        const existingKeys = data.map(s => s.key);
        
        expectedKeys.forEach(key => {
            if (existingKeys.includes(key)) {
                console.log(`✅ "${key}" mevcut`);
            } else {
                console.log(`❌ "${key}" EKSİK`);
            }
        });
        
    } catch (error) {
        console.error('❌ Hata:', error);
    }
}

checkSettings().catch(console.error); 