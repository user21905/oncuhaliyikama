require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function addMissingSettings() {
    try {
        console.log('🔧 Eksik ayarlar ekleniyor...');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL ve SUPABASE_ANON_KEY environment variables eksik');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Eksik ayarları ekle
        const missingSettings = [
            { key: 'map_latitude', value: '37.842249' },
            { key: 'map_longitude', value: '40.669449' }
        ];
        
        for (const setting of missingSettings) {
            try {
                console.log(`🔧 Ayar ekleniyor: ${setting.key} = ${setting.value}`);
                
                const { data, error } = await supabase
                    .from('settings')
                    .upsert({ 
                        key: setting.key, 
                        value: setting.value 
                    }, { 
                        onConflict: 'key' 
                    })
                    .select();
                
                if (error) {
                    console.error(`❌ Ayar eklenemedi (${setting.key}):`, error);
                } else {
                    console.log(`✅ Ayar başarıyla eklendi: ${setting.key}`);
                }
            } catch (error) {
                console.error(`❌ Ayar eklenirken hata (${setting.key}):`, error.message);
            }
        }
        
        console.log('✅ Tüm eksik ayarlar eklendi!');
        
    } catch (error) {
        console.error('❌ Script hatası:', error);
    }
}

addMissingSettings(); 