const { createClient } = require('@supabase/supabase-js');

async function checkHomepageBg() {
    console.log('🔍 Homepage background ayarı kontrol ediliyor...');
    
    // Supabase client oluştur
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase environment variables eksik!');
        console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
        console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Settings tablosundan homepage_hero_bg ayarını al
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'homepage_hero_bg')
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('⚠️ homepage_hero_bg ayarı veritabanında bulunamadı!');
                console.log('Bu ayar henüz oluşturulmamış.');
            } else {
                console.error('❌ Veritabanı hatası:', error);
            }
        } else {
            console.log('✅ homepage_hero_bg ayarı bulundu:');
            console.log('ID:', data.id);
            console.log('Key:', data.key);
            console.log('Value:', data.value);
            console.log('Created at:', data.created_at);
            console.log('Updated at:', data.updated_at);
            
            if (data.value && data.value.trim() !== '') {
                console.log('🎯 URL mevcut, görsel erişilebilir mi test ediliyor...');
                
                try {
                    const imgResponse = await fetch(data.value);
                    console.log('🖼️ Görsel durumu:', imgResponse.status);
                    console.log('🖼️ Görsel erişilebilir:', imgResponse.ok);
                } catch (imgError) {
                    console.error('❌ Görsel erişim hatası:', imgError.message);
                }
            } else {
                console.log('⚠️ URL boş veya tanımsız');
            }
        }
        
        // Tüm settings ayarlarını da listele
        console.log('\n📋 Tüm settings ayarları:');
        const { data: allSettings, error: allError } = await supabase
            .from('settings')
            .select('*')
            .order('key');
            
        if (allError) {
            console.error('❌ Tüm ayarları alma hatası:', allError);
        } else {
            allSettings.forEach(setting => {
                console.log(`${setting.key}: ${setting.value}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Genel hata:', error);
    }
}

// Test'i çalıştır
checkHomepageBg().then(() => {
    console.log('\n✅ Kontrol tamamlandı');
    process.exit(0);
}).catch(error => {
    console.error('❌ Kontrol hatası:', error);
    process.exit(1);
}); 