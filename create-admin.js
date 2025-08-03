require('dotenv').config();
const SupabaseUserRepository = require('./database/repositories/SupabaseUserRepository');

async function createAdminUser() {
    console.log('👤 Admin Kullanıcısı Oluşturma');
    console.log('==============================\n');

    try {
        const userRepo = new SupabaseUserRepository();
        
        // Admin bilgileri
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'BismilVinc2024!';
        
        console.log('📧 Admin Email:', adminEmail);
        console.log('🔑 Admin Password:', adminPassword);
        console.log('');

        // Mevcut admin kullanıcısını kontrol et
        console.log('🔍 Mevcut admin kullanıcısı kontrol ediliyor...');
        const existingAdmin = await userRepo.findByEmail(adminEmail);
        
        if (existingAdmin) {
            console.log('✅ Admin kullanıcısı zaten mevcut');
            console.log('   ID:', existingAdmin.id);
            console.log('   Email:', existingAdmin.email);
            console.log('   Role:', existingAdmin.role);
            
            // Şifreyi güncelle
            console.log('🔄 Şifre güncelleniyor...');
            await userRepo.changePassword(existingAdmin.id, adminPassword);
            console.log('✅ Şifre güncellendi');
        } else {
            console.log('❌ Admin kullanıcısı bulunamadı, oluşturuluyor...');
            
            // Yeni admin kullanıcısı oluştur
            const adminData = {
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            };
            
            const newAdmin = await userRepo.create(adminData);
            console.log('✅ Admin kullanıcısı oluşturuldu');
            console.log('   ID:', newAdmin.id);
            console.log('   Email:', newAdmin.email);
            console.log('   Role:', newAdmin.role);
        }
        
        // Authentication test
        console.log('\n🔐 Authentication Test:');
        const authResult = await userRepo.authenticate(adminEmail, adminPassword);
        
        if (authResult.success) {
            console.log('✅ Authentication başarılı');
            console.log('   User:', authResult.user);
        } else {
            console.log('❌ Authentication başarısız');
            console.log('   Hata:', authResult.message);
        }
        
    } catch (error) {
        console.error('❌ Admin oluşturma hatası:', error);
        console.error('Stack:', error.stack);
    }
}

createAdminUser(); 