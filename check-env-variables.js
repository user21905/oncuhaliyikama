const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Environment Variables Kontrol Ediliyor...');
console.log('=====================================');

const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'NODE_ENV'
];

let allPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD') ? 'VAR (gizli)' : value.substring(0, 50) + (value.length > 50 ? '...' : '')}`);
    } else {
        console.log(`❌ ${varName}: YOK`);
        allPresent = false;
    }
});

console.log('=====================================');
console.log(`Sonuç: ${allPresent ? '✅ Tüm environment variables mevcut' : '❌ Bazı environment variables eksik'}`);

// Supabase bağlantısını test et
async function testSupabase() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        console.log('\n🔗 Supabase bağlantısı test ediliyor...');
        
        const { createClient } = require('@supabase/supabase-js');
        
        try {
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
            
            // Basit bir test sorgusu
            const { data, error } = await supabase.from('settings').select('count').limit(1);
            
            if (error) {
                console.log('❌ Supabase bağlantı hatası:', error.message);
            } else {
                console.log('✅ Supabase bağlantısı başarılı');
            }
        } catch (error) {
            console.log('❌ Supabase bağlantı hatası:', error.message);
        }
    } else {
        console.log('\n⚠️ Supabase bağlantısı test edilemedi - environment variables eksik');
    }
}

testSupabase(); 