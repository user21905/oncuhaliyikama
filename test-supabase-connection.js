require('dotenv').config();
const supabaseConnection = require('./database/supabase-connection');

async function testSupabaseConnection() {
    console.log('🔍 Supabase bağlantı testi başlıyor...');
    console.log('Environment variables:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Tanımlı' : '❌ Eksik');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Tanımlı' : '❌ Eksik');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Tanımlı' : '❌ Eksik');
    
    try {
        const client = await supabaseConnection.connect();
        console.log('✅ Supabase bağlantısı başarılı!');
        
        // Test query
        const { data, error } = await client.from('settings').select('*').limit(1);
        if (error) {
            console.log('⚠️ Settings tablosu sorgusu hatası:', error.message);
        } else {
            console.log('✅ Settings tablosu sorgusu başarılı');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Supabase bağlantı hatası:', error.message);
        return false;
    }
}

testSupabaseConnection().then(success => {
    if (success) {
        console.log('🎉 Tüm testler başarılı!');
    } else {
        console.log('💥 Testler başarısız!');
    }
    process.exit(success ? 0 : 1);
}); 