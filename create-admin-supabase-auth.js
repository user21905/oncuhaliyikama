require('dotenv').config();
const supabaseConnection = require('./database/supabase-connection');

async function createAdminUserWithSupabaseAuth() {
    console.log('👤 Supabase Auth ile Admin Kullanıcısı Oluşturma');
    console.log('==============================================\n');

    try {
        await supabaseConnection.connect();
        const supabase = supabaseConnection.getClient();
        
        // Admin bilgileri
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'BismilVinc2024!';
        
        console.log('📧 Admin Email:', adminEmail);
        console.log('🔑 Admin Password:', adminPassword);
        console.log('');

        // 1. Supabase Auth ile kullanıcı oluştur
        console.log('🔐 Supabase Auth ile kullanıcı oluşturuluyor...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log('✅ Kullanıcı zaten Supabase Auth\'da mevcut');
            } else {
                console.error('❌ Supabase Auth hatası:', authError);
                return;
            }
        } else {
            console.log('✅ Supabase Auth kullanıcısı oluşturuldu');
            console.log('   User ID:', authData.user.id);
        }

        // 2. Users tablosuna admin bilgilerini ekle
        console.log('\n📊 Users tablosuna admin bilgileri ekleniyor...');
        
        // Önce mevcut kullanıcıyı kontrol et
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', adminEmail)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('❌ Kullanıcı kontrol hatası:', checkError);
            return;
        }

        if (existingUser) {
            console.log('✅ Admin kullanıcısı zaten users tablosunda mevcut');
            console.log('   ID:', existingUser.id);
            console.log('   Email:', existingUser.email);
            console.log('   Role:', existingUser.role);
        } else {
            // Yeni admin kullanıcısı ekle
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    email: adminEmail,
                    password_hash: 'supabase_auth', // Supabase Auth kullandığımız için placeholder
                    role: 'admin'
                }])
                .select()
                .single();

            if (insertError) {
                console.error('❌ Users tablosuna ekleme hatası:', insertError);
                return;
            }

            console.log('✅ Admin kullanıcısı users tablosuna eklendi');
            console.log('   ID:', newUser.id);
            console.log('   Email:', newUser.email);
            console.log('   Role:', newUser.role);
        }

        // 3. Test login
        console.log('\n🔐 Test Login:');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
        });

        if (loginError) {
            console.error('❌ Login hatası:', loginError);
        } else {
            console.log('✅ Login başarılı');
            console.log('   User ID:', loginData.user.id);
            console.log('   Email:', loginData.user.email);
            console.log('   Access Token:', loginData.session.access_token ? '✅ VAR' : '❌ YOK');
        }

    } catch (error) {
        console.error('❌ Admin oluşturma hatası:', error);
        console.error('Stack:', error.stack);
    }
}

createAdminUserWithSupabaseAuth(); 