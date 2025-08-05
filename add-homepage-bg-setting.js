const { createClient } = require('@supabase/supabase-js');

async function addHomepageBgSetting() {
    console.log('🔧 Homepage background ayarı ekleniyor...');
    
    // Supabase client oluştur (Vercel environment variables kullan)
    const supabaseUrl = 'https://dhslapns1.supabase.co'; // Vercel'deki URL
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoc2xhcG5zMSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NTQzOTc5MTgsImV4cCI6MjA3MDA1MzkxOH0.8fdfb40866c1'; // Service role key
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Önce mevcut ayarı kontrol et
        const { data: existing, error: checkError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'homepage_hero_bg')
            .single();
            
        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Kontrol hatası:', checkError);
            return;
        }
        
        if (existing) {
            console.log('✅ Ayar zaten mevcut, güncelleniyor...');
            console.log('Mevcut değer:', existing.value);
            
            // Test Cloudinary URL'si ile güncelle
            const testUrl = 'https://res.cloudinary.com/dhslapns1/image/upload/v1754397918/bismil-vinc/bismil-vinc/1754397917819_LOGOOO.png.png';
            
            const { data: updated, error: updateError } = await supabase
                .from('settings')
                .update({ value: testUrl })
                .eq('key', 'homepage_hero_bg')
                .select()
                .single();
                
            if (updateError) {
                console.error('❌ Güncelleme hatası:', updateError);
            } else {
                console.log('✅ Ayar güncellendi:', updated);
            }
        } else {
            console.log('➕ Yeni ayar oluşturuluyor...');
            
            // Test Cloudinary URL'si ile yeni ayar oluştur
            const testUrl = 'https://res.cloudinary.com/dhslapns1/image/upload/v1754397918/bismil-vinc/bismil-vinc/1754397917819_LOGOOO.png.png';
            
            const { data: created, error: createError } = await supabase
                .from('settings')
                .insert([{
                    key: 'homepage_hero_bg',
                    value: testUrl
                }])
                .select()
                .single();
                
            if (createError) {
                console.error('❌ Oluşturma hatası:', createError);
            } else {
                console.log('✅ Ayar oluşturuldu:', created);
            }
        }
        
        // Sonucu kontrol et
        console.log('\n🔍 Son kontrol...');
        const { data: final, error: finalError } = await supabase
            .from('settings')
            .select('*')
            .eq('key', 'homepage_hero_bg')
            .single();
            
        if (finalError) {
            console.error('❌ Final kontrol hatası:', finalError);
        } else {
            console.log('✅ Final durum:', final);
            
            // API'yi test et
            console.log('\n🌐 API test ediliyor...');
            try {
                const response = await fetch('https://bismilvinc.com/api/settings');
                const apiData = await response.json();
                
                if (apiData.success && apiData.data && apiData.data.homepage_hero_bg) {
                    console.log('✅ API\'den homepage_hero_bg döndü:', apiData.data.homepage_hero_bg);
                } else {
                    console.log('❌ API\'den homepage_hero_bg dönmedi');
                    console.log('API response:', apiData);
                }
            } catch (apiError) {
                console.error('❌ API test hatası:', apiError.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Genel hata:', error);
    }
}

// Test'i çalıştır
addHomepageBgSetting().then(() => {
    console.log('\n✅ İşlem tamamlandı');
    process.exit(0);
}).catch(error => {
    console.error('❌ İşlem hatası:', error);
    process.exit(1);
}); 