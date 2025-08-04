const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixSupabaseSettings() {
    try {
        console.log('🔧 Supabase ayarları düzeltiliyor...');
        
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ SUPABASE_URL veya SUPABASE_ANON_KEY eksik');
            return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Önce mevcut ayarları kontrol et
        console.log('📋 Mevcut ayarlar kontrol ediliyor...');
        const { data: existingSettings, error: fetchError } = await supabase
            .from('settings')
            .select('*');
            
        if (fetchError) {
            console.error('❌ Ayarlar alınamadı:', fetchError);
            return;
        }
        
        console.log('Mevcut ayarlar:', existingSettings);
        
        // Test Site Title'ı temizle ve doğru değerleri ayarla
        const correctSettings = [
            { key: 'navbar_company_name', value: 'Bismil Vinç' },
            { key: 'navbar_home_link', value: 'Ana Sayfa' },
            { key: 'navbar_services_link', value: 'Hizmetler' },
            { key: 'navbar_about_link', value: 'Hakkımızda' },
            { key: 'navbar_contact_link', value: 'İletişim' },
            { key: 'footer_company_name', value: 'Bismil Vinç' },
            { key: 'footer_description', value: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri' },
            { key: 'footer_phone', value: '0555 123 45 67' },
            { key: 'footer_whatsapp', value: '0555 123 45 67' },
            { key: 'footer_email', value: 'info@bismilvinc.com' },
            { key: 'footer_address', value: 'Bismil, Diyarbakır' },
            { key: 'footer_working_hours', value: '7/24 Hizmet' }
        ];
        
        // Her ayarı güncelle veya oluştur
        for (const setting of correctSettings) {
            const { data: existingSetting } = await supabase
                .from('settings')
                .select('*')
                .eq('key', setting.key)
                .single();
                
            if (existingSetting) {
                // Güncelle
                const { error: updateError } = await supabase
                    .from('settings')
                    .update({ value: setting.value })
                    .eq('key', setting.key);
                    
                if (updateError) {
                    console.error(`❌ ${setting.key} güncellenemedi:`, updateError);
                } else {
                    console.log(`✅ ${setting.key} güncellendi: ${setting.value}`);
                }
            } else {
                // Yeni oluştur
                const { error: insertError } = await supabase
                    .from('settings')
                    .insert([setting]);
                    
                if (insertError) {
                    console.error(`❌ ${setting.key} oluşturulamadı:`, insertError);
                } else {
                    console.log(`✅ ${setting.key} oluşturuldu: ${setting.value}`);
                }
            }
        }
        
        // Test Site Title'ı sil
        const { error: deleteError } = await supabase
            .from('settings')
            .delete()
            .eq('key', 'site_title')
            .or('key.like.%test%');
            
        if (deleteError) {
            console.error('❌ Test ayarları silinemedi:', deleteError);
        } else {
            console.log('✅ Test ayarları temizlendi');
        }
        
        console.log('🎉 Supabase ayarları düzeltildi!');
        
    } catch (error) {
        console.error('❌ Hata:', error);
    }
}

fixSupabaseSettings(); 