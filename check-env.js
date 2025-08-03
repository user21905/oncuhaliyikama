require('dotenv').config();
const supabaseConnection = require('./database/supabase-connection');
const SupabaseUserRepository = require('./database/repositories/SupabaseUserRepository');

async function checkEnvironment() {
    console.log('🔍 Environment Variables Kontrolü');
    console.log('================================\n');

    // 1. Environment Variables Kontrolü
    console.log('📋 Environment Variables:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ VAR' : '❌ YOK');
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ VAR' : '❌ YOK');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ VAR' : '❌ YOK');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ YOK');
    console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? '✅ VAR' : '❌ YOK');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ VAR' : '❌ YOK');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ VAR' : '❌ YOK');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ VAR' : '❌ YOK');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('');

    // 2. Supabase Bağlantı Kontrolü
    console.log('🔗 Supabase Bağlantı Kontrolü:');
    try {
        await supabaseConnection.connect();
        console.log('✅ Supabase bağlantısı başarılı');
        
        const supabase = supabaseConnection.getClient();
        console.log('✅ Supabase client hazır');
        
        // 3. Admin Kullanıcı Kontrolü
        console.log('\n👤 Admin Kullanıcı Kontrolü:');
        const userRepo = new SupabaseUserRepository();
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
        console.log('Aranan admin email:', adminEmail);
        
        const adminUser = await userRepo.findByEmail(adminEmail);
        
        if (adminUser) {
            console.log('✅ Admin kullanıcısı bulundu');
            console.log('   ID:', adminUser.id);
            console.log('   Email:', adminUser.email);
            console.log('   Role:', adminUser.role);
            console.log('   Password Hash:', adminUser.password_hash ? '✅ VAR' : '❌ YOK');
        } else {
            console.log('❌ Admin kullanıcısı bulunamadı');
            console.log('🔄 Admin kullanıcısı oluşturuluyor...');
            
            try {
                await userRepo.initializeDefaultAdmin();
                console.log('✅ Admin kullanıcısı oluşturuldu');
            } catch (error) {
                console.error('❌ Admin kullanıcısı oluşturulamadı:', error.message);
            }
        }
        
        // 4. Test Authentication
        console.log('\n🔐 Test Authentication:');
        const testPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const authResult = await userRepo.authenticate(adminEmail, testPassword);
        
        if (authResult.success) {
            console.log('✅ Authentication başarılı');
            console.log('   User:', authResult.user);
        } else {
            console.log('❌ Authentication başarısız');
            console.log('   Hata:', authResult.message);
        }
        
    } catch (error) {
        console.error('❌ Supabase bağlantı hatası:', error.message);
        console.log('🔧 Supabase URL ve ANON_KEY kontrol edin');
    }
    
    console.log('\n📊 Özet:');
    console.log('Environment variables eksikse, .env dosyasını kontrol edin');
    console.log('Supabase bağlantı hatası varsa, URL ve API key kontrol edin');
    console.log('Admin kullanıcısı yoksa, otomatik oluşturulacak');
}

checkEnvironment().catch(console.error); 