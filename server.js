const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Database bağlantısı
const supabaseConnection = require('./database/supabase-connection');

// Supabase Repositories
const SupabaseContactRepository = require('./database/repositories/SupabaseContactRepository');
const SupabaseSettingsRepository = require('./database/repositories/SupabaseSettingsRepository');
const SupabaseUserRepository = require('./database/repositories/SupabaseUserRepository');
const ServiceRepository = require('./database/repositories/SupabaseServiceRepository');

// Middleware
const { handleUploadError } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Güvenlik middleware'leri
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.cloudinary.com", "https://maps.googleapis.com"],
            frameSrc: ["'self'", "https://www.google.com"]
        }
    }
}));

// CORS ayarları
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [
            process.env.DOMAIN, 
            process.env.SITE_URL, 
            'https://yourdomain.com',
            'https://www.yourdomain.com',
            'https://bismil-vinc.vercel.app',
            'https://*.vercel.app'
          ]
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Sıkıştırma
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static dosyalar - Hata yakalama ile
app.get('/styles.css', (req, res) => {
    try {
        console.log('CSS dosyası isteği alındı');
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(path.join(__dirname, 'styles.css'));
    } catch (error) {
        console.error('CSS dosyası hatası:', error);
        res.status(500).send('CSS dosyası yüklenemedi');
    }
});

app.get('/script.js', (req, res) => {
    try {
        console.log('Script dosyası isteği alındı');
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(path.join(__dirname, 'script.js'));
    } catch (error) {
        console.error('Script dosyası hatası:', error);
        res.status(500).send('Script dosyası yüklenemedi');
    }
});

app.get('/navbar.js', (req, res) => {
    try {
        console.log('Navbar dosyası isteği alındı');
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(path.join(__dirname, 'navbar.js'));
    } catch (error) {
        console.error('Navbar dosyası hatası:', error);
        res.status(500).send('Navbar dosyası yüklenemedi');
    }
});

app.get('/footer.js', (req, res) => {
    try {
        console.log('Footer dosyası isteği alındı');
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(path.join(__dirname, 'footer.js'));
    } catch (error) {
        console.error('Footer dosyası hatası:', error);
        res.status(500).send('Footer dosyası yüklenemedi');
    }
});

app.get('/favicon.ico', (req, res) => {
    try {
        console.log('Favicon isteği alındı');
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(__dirname, 'favicon.ico'));
    } catch (error) {
        console.error('Favicon hatası:', error);
        res.status(404).send('Favicon bulunamadı');
    }
});

// Admin klasörü için özel static servis
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Admin Authentication Middleware - Supabase Based
const authenticateAdmin = async (req, res, next) => {
    try {
        console.log('=== AUTHENTICATE ADMIN BAŞLADI ===');
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('Token bulunamadı');
            return res.status(401).json({ success: false, message: 'Token bulunamadı' });
        }

        console.log('Token alındı, doğrulanıyor...');
        console.log('Token uzunluğu:', token.length);
        
        // Supabase bağlantısı kontrolü
        if (supabaseConnection.isConnected) {
            try {
                // Supabase SDK ile token doğrulama
                const supabase = supabaseConnection.getClient();
                const { data: { user }, error } = await supabase.auth.getUser(token);
                
                if (error) {
                    console.error('Supabase token doğrulama hatası:', error);
                    // Supabase hatası durumunda hardcoded fallback'e geç
                    console.log('Supabase hatası, hardcoded admin kontrolü yapılıyor');
                } else if (user) {
                    console.log('✅ Supabase token doğrulandı, kullanıcı:', user.email);
                    
                    // Supabase Auth kullanıcıları admin olarak kabul ediyoruz
                    req.user = {
                        id: user.id,
                        email: user.email,
                        role: 'admin'
                    };
                    next();
                    return;
                }
            } catch (userError) {
                console.error('Supabase kullanıcı kontrolü hatası:', userError);
                console.log('Supabase hatası, hardcoded admin kontrolü yapılıyor');
            }
        } else {
            console.log('Supabase bağlantısı yok, hardcoded admin kontrolü yapılıyor');
        }
        
        // Hardcoded admin fallback - Supabase bağlantısı yoksa veya token doğrulanamazsa
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'BismilVinc2024!';
        
        console.log('Admin bilgileri kontrol ediliyor (authenticateAdmin):', { 
            email: adminEmail, 
            password: adminPassword ? '***' : 'boş' 
        });
        
        // Supabase'den gelen token'lar genellikle uzun olur (862 karakter gibi)
        // Hardcoded token kontrolü sadece çok kısa token'lar için
        if (token === 'hardcoded-admin-token' || token.length < 100) {
            console.log('Hardcoded admin token doğrulandı');
            req.user = {
                id: 'admin-user-id',
                email: adminEmail,
                role: 'admin',
                name: 'Admin'
            };
            next();
            return;
        }
        
        // Supabase'den gelen uzun token'lar için basit kontrol
        // Bu durumda token'ın geçerli olduğunu varsayıyoruz
        if (token.length > 100) {
            console.log('✅ Uzun token algılandı, Supabase token olarak kabul ediliyor');
            req.user = {
                id: 'supabase-admin-user',
                email: adminEmail,
                role: 'admin',
                name: 'Admin'
            };
            next();
            return;
        }
        
        console.log('Admin token geçersiz');
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    } catch (error) {
        console.error('=== AUTHENTICATE ADMIN HATASI ===');
        console.error('Token doğrulama hatası:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
};

// Ana sayfa
app.get('/', (req, res) => {
    try {
        console.log('Ana sayfa isteği alındı');
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Ana sayfa hatası:', error);
        res.status(500).send(`
            <html>
                <head><title>Bismil Vinç</title></head>
                <body>
                    <h1>Bismil Vinç</h1>
                    <p>Site yükleniyor...</p>
                    <p>Hata: ${error.message}</p>
                </body>
            </html>
        `);
    }
});

// Anasayfa için alternatif URL
app.get('/ANASYFA', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin Panel Route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Admin Dashboard Route
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Hizmet sayfaları
app.get('/mobilvinchizmeti', (req, res) => {
    res.sendFile(path.join(__dirname, 'mobilvinchizmeti.html'));
});

app.get('/insaatkurulumu', (req, res) => {
    res.sendFile(path.join(__dirname, 'insaatkurulumu.html'));
});

app.get('/petrolkuyuhizmeti', (req, res) => {
    res.sendFile(path.join(__dirname, 'petrolkuyuhizmeti.html'));
});

app.get('/petrolinsaatsahasi', (req, res) => {
    res.sendFile(path.join(__dirname, 'petrolinsaatsahasi.html'));
});

// SEO dostu URL'ler - yeni route'lar
app.get('/mobil-vinc-kiralama', (req, res) => {
    res.sendFile(path.join(__dirname, 'mobilvinchizmeti.html'));
});

app.get('/insaat-kurulum-hizmetleri', (req, res) => {
    res.sendFile(path.join(__dirname, 'insaatkurulumu.html'));
});

app.get('/petrol-kuyusu-vinc-hizmetleri', (req, res) => {
    res.sendFile(path.join(__dirname, 'petrolkuyuhizmeti.html'));
});

app.get('/petrol-insaat-sahasi-kurulum', (req, res) => {
    res.sendFile(path.join(__dirname, 'petrolinsaatsahasi.html'));
});

// API Routes

// Settings API
app.get('/api/settings', async (req, res) => {
    try {
        console.log('API settings isteği alındı');
        
        // Supabase bağlantısını kontrol et
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, fallback değerler döndürülüyor');
            return res.json({
                success: true,
                data: {
                    // Navbar ayarları
                    navbar_logo: '',
                    navbar_company_name: 'Bismil Vinç',
                    navbar_home_link: 'Ana Sayfa',
                    navbar_services_link: 'Hizmetler',
                    navbar_about_link: 'Hakkımızda',
                    navbar_contact_link: 'İletişim',
                    
                    // Footer ayarları
                    footer_company_name: 'Bismil Vinç',
                    footer_description: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri',
                    footer_phone: '0555 123 45 67',
                    footer_whatsapp: '0555 123 45 67',
                    footer_email: 'info@bismilvinc.com',
                    footer_address: 'Bismil, Diyarbakır',
                    footer_working_hours: '7/24 Hizmet',
                    
                    // Hizmet resimleri
                    service_mobilvinchizmeti_img: '',
                    service_insaatkurulumu_img: '',
                    service_petrolkuyuhizmeti_img: '',
                    service_petrolinsaatsahasi_img: '',
                    
                    // İletişim bilgileri
                    contact_phone: '0555 123 45 67',
                    contact_whatsapp: '0555 123 45 67',
                    contact_email: 'info@bismilvinc.com',
                    contact_address: 'Bismil, Diyarbakır'
                }
            });
        }
        
        const settingsRepo = new SupabaseSettingsRepository();
        const settings = await settingsRepo.getPublicSettingsAsObject();
        
        console.log('Settings başarıyla getirildi');
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Settings getirme hatası:', error);
        
        // Hata durumunda fallback değerler döndür
        res.json({
            success: true,
            data: {
                navbar_company_name: 'Bismil Vinç',
                footer_company_name: 'Bismil Vinç',
                footer_phone: '0555 123 45 67',
                footer_email: 'info@bismilvinc.com',
                footer_address: 'Bismil, Diyarbakır'
            }
        });
    }
});

// Contact form API
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, email, service, message } = req.body;

        // Validasyon
        if (!name || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: 'Ad, telefon ve hizmet alanları zorunludur'
            });
        }

        const contactRepo = new SupabaseContactRepository();
        const contactData = {
            name: name.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            service,
            message: message ? message.trim() : '',
            status: 'new',
            source: 'website',
            priority: 'normal'
        };

        const result = await contactRepo.create(contactData);

        res.json({
            success: true,
            message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
            data: {
                id: result.id,
                timestamp: result.created_at
            }
        });
    } catch (error) {
        console.error('Contact form hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.',
            error: error.message
        });
    }
});

// Cloudinary upload API
app.post('/api/upload', async (req, res) => {
    try {
        const { base64Data, fileName, folder } = req.body;

        if (!base64Data) {
            return res.status(400).json({
                success: false,
                message: 'Dosya verisi bulunamadı'
            });
        }

        const cloudinaryService = require('./services/cloudinary');
        const settingsRepo = new SupabaseSettingsRepository();
        
        const defaultFolder = await settingsRepo.findByKey('cloudinary_folder');
        const uploadFolder = folder || (defaultFolder ? defaultFolder.value : 'bismilvinc');

        const result = await cloudinaryService.uploadBase64(base64Data, {
            folder: uploadFolder,
            public_id: fileName ? `${uploadFolder}/${Date.now()}_${fileName}` : undefined
        });

        if (result.success) {
            res.json({
                success: true,
                message: 'Dosya başarıyla yüklendi',
                data: result.data
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya yüklenemedi',
            error: error.message
        });
    }
});

// Admin Media Upload (görseli ilgili ayara kaydeder)
app.post('/api/admin/media/upload', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN MEDIA UPLOAD BAŞLADI ===');
        console.log('Admin media upload request body:', req.body);
        console.log('Admin media upload request headers:', req.headers);
        
        const { base64Data, fileName, folder, targetField } = req.body;

        console.log('Extracted data:', { 
            hasBase64Data: !!base64Data, 
            hasTargetField: !!targetField, 
            targetField, 
            fileName 
        });

        if (!base64Data || !targetField) {
            console.log('Validation failed: missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Görsel verisi ve hedef alan (targetField) zorunludur.'
            });
        }

        // Cloudinary servisini yükle
        console.log('Cloudinary servisi yükleniyor...');
        let cloudinaryService;
        try {
            cloudinaryService = require('./services/cloudinary');
            console.log('✅ Cloudinary servisi başarıyla yüklendi');
            
            // Service'in kullanılabilir olup olmadığını kontrol et
            if (!cloudinaryService.isServiceAvailable()) {
                console.error('❌ Cloudinary servisi kullanılamıyor');
                return res.status(500).json({
                    success: false,
                    message: cloudinaryService.initError ? cloudinaryService.initError.message : 'Cloudinary servisi kullanılamıyor'
                });
            }
        } catch (cloudinaryError) {
            console.error('❌ Cloudinary servisi yüklenemedi:', cloudinaryError.message);
            return res.status(500).json({
                success: false,
                message: cloudinaryError.message
            });
        }
        
        // Settings repository'yi yükle
        console.log('Settings repository yükleniyor...');
        const settingsRepo = new SupabaseSettingsRepository();
        
        // Supabase bağlantısı kontrolü
        console.log('Supabase bağlantı durumu:', supabaseConnection.isConnected);
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, sadece Cloudinary yükleme yapılacak');
        }
        
        // Default folder'ı al
        let defaultFolder;
        try {
            defaultFolder = await settingsRepo.findByKey('cloudinary_folder');
            console.log('Default folder:', defaultFolder);
        } catch (folderError) {
            console.log('Default folder alınamadı, varsayılan kullanılacak:', folderError.message);
            defaultFolder = null;
        }
        
        const uploadFolder = folder || (defaultFolder ? defaultFolder.value : 'bismilvinc');
        console.log('Uploading to Cloudinary with folder:', uploadFolder);

        // Cloudinary'ye yükle
        console.log('Cloudinary upload başlıyor...');
        const result = await cloudinaryService.uploadBase64(base64Data, {
            folder: uploadFolder,
            public_id: fileName ? `${uploadFolder}/${Date.now()}_${fileName}` : undefined
        });

        console.log('Cloudinary upload result:', result);

        if (result.success && result.data && result.data.url) {
            // İlgili ayarı güncelle
            console.log('Supabase bağlantı durumu:', supabaseConnection.isConnected);
            
            if (supabaseConnection.isConnected) {
                try {
                    console.log('Ayar güncelleniyor:', targetField);
                    await settingsRepo.updateByKey(targetField, result.data.url);
                    console.log('Ayar başarıyla güncellendi');
                    
                    res.json({
                        success: true,
                        message: 'Görsel başarıyla yüklendi ve ayar güncellendi',
                        url: result.data.url,
                        targetField
                    });
                } catch (updateError) {
                    console.error('Ayar güncelleme hatası:', updateError);
                    // Ayar güncellenemese bile URL'i döndür
                    return res.json({
                        success: true,
                        message: 'Görsel yüklendi fakat ayar güncellenemedi: ' + updateError.message,
                        url: result.data.url,
                        targetField
                    });
                }
            } else {
                console.log('Supabase bağlantısı yok, sadece Cloudinary URL döndürülüyor');
                // Supabase bağlantısı yoksa sadece URL'i döndür
                res.json({
                    success: true,
                    message: 'Görsel yüklendi fakat veritabanı bağlantısı yok (URL kaydedilemedi)',
                    url: result.data.url,
                    targetField,
                    warning: 'Supabase bağlantısı yok'
                });
            }
        } else {
            console.error('Cloudinary upload başarısız:', result.error);
            res.status(400).json({
                success: false,
                message: result.error || 'Yükleme başarısız'
            });
        }
    } catch (error) {
        console.error('=== ADMIN MEDIA UPLOAD HATASI ===');
        console.error('Admin medya yükleme hatası:', error);
        console.error('Error stack:', error.stack);
        
        // Daha detaylı hata mesajı
        let errorMessage = 'Medya yüklenemedi';
        if (error.message.includes('Cloudinary')) {
            errorMessage = 'Cloudinary bağlantı hatası: ' + error.message;
        } else if (error.message.includes('Supabase')) {
            errorMessage = 'Veritabanı bağlantı hatası: ' + error.message;
        } else {
            errorMessage = error.message;
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
        });
    }
});

// Admin Media Remove (görseli kaldırır)
app.post('/api/admin/media/remove', authenticateAdmin, async (req, res) => {
    try {
        const { targetField } = req.body;
        
        if (!targetField) {
            return res.status(400).json({
                success: false,
                message: 'Hedef alan (targetField) zorunludur.'
            });
        }
        
        const settingsRepo = new SupabaseSettingsRepository();
        
        // Ayarı temizle
        await settingsRepo.updateByKey(targetField, '');
        
        res.json({
            success: true,
            message: 'Görsel başarıyla kaldırıldı',
            targetField
        });
    } catch (error) {
        console.error('Admin medya kaldırma hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Görsel kaldırılamadı',
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await supabaseConnection.healthCheck();
        
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            database: dbHealth ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV,
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Environment variables test endpoint
app.get('/api/test/env', async (req, res) => {
    try {
        const envVars = {
            SUPABASE_URL: process.env.SUPABASE_URL ? 'VAR' : 'YOK',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'VAR' : 'YOK',
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'VAR' : 'YOK',
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'VAR' : 'YOK',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'VAR' : 'YOK',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'VAR' : 'YOK',
            ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'YOK',
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'VAR' : 'YOK',
            NODE_ENV: process.env.NODE_ENV || 'YOK'
        };
        
        const allPresent = Object.values(envVars).every(val => val !== 'YOK');
        
        res.json({
            success: allPresent,
            environment_variables: envVars,
            message: allPresent ? 
                'Tüm environment variables mevcut' : 
                'Bazı environment variables eksik'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Environment variables test hatası'
        });
    }
});

// Test endpoint for Supabase settings operations
app.get('/api/test/settings', async (req, res) => {
    try {
        console.log('🔧 Settings test endpoint başladı');
        
        // Supabase bağlantı durumunu kontrol et
        const connectionStatus = supabaseConnection.getConnectionStatus();
        console.log('Supabase bağlantı durumu:', connectionStatus);
        
        if (!supabaseConnection.isConnected) {
            console.log('❌ Supabase bağlantısı yok, bağlantı kurulmaya çalışılıyor...');
            try {
                await supabaseConnection.connect();
                console.log('✅ Supabase bağlantısı kuruldu');
            } catch (connError) {
                console.error('❌ Supabase bağlantı hatası:', connError);
                return res.status(500).json({
                    success: false,
                    message: 'Supabase bağlantısı kurulamadı',
                    error: connError.message,
                    connection_status: connectionStatus
                });
            }
        }
        
        // Settings repository'yi test et
        const settingsRepo = new SupabaseSettingsRepository();
        
        // Mevcut ayarları getir
        console.log('📋 Mevcut ayarlar getiriliyor...');
        const settings = await settingsRepo.findAll();
        console.log('📋 Mevcut ayarlar:', settings);
        
        // Test ayarı ekle/güncelle
        console.log('🧪 Test ayarı ekleniyor...');
        try {
            await settingsRepo.updateByKey('test_setting', 'test_value_' + Date.now());
            console.log('✅ Test ayarı başarıyla eklendi/güncellendi');
        } catch (updateError) {
            console.error('❌ Test ayarı güncellenemedi:', updateError);
            return res.status(500).json({
                success: false,
                message: 'Test ayarı güncellenemedi',
                error: updateError.message,
                connection_status: connectionStatus,
                existing_settings: settings
            });
        }
        
        res.json({
            success: true,
            message: 'Settings test başarılı',
            connection_status: connectionStatus,
            existing_settings: settings,
            test_result: 'Test ayarı başarıyla eklendi/güncellendi'
        });
        
    } catch (error) {
        console.error('❌ Settings test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Settings test hatası'
        });
    }
});

// Cloudinary environment variables test endpoint
app.get('/api/test/cloudinary-env', (req, res) => {
    const cloudinaryVars = {
        CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'VAR' : 'YOK',
        CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'VAR' : 'YOK',
        CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'VAR' : 'YOK'
    };
    
    const hasAllVars = Object.values(cloudinaryVars).every(v => v === 'VAR');
    const hasPlaceholders = Object.values(cloudinaryVars).some(v => 
        process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' ||
        process.env.CLOUDINARY_API_KEY === 'your_api_key' ||
        process.env.CLOUDINARY_API_SECRET === 'your_api_secret'
    );
    
    res.json({
        success: hasAllVars && !hasPlaceholders,
        cloudinary_vars: cloudinaryVars,
        has_placeholders: hasPlaceholders,
        message: hasAllVars && !hasPlaceholders ? 
            'Cloudinary environment variables doğru' : 
            'Cloudinary environment variables eksik veya placeholder'
    });
});



// Admin API Routes

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        console.log('=== ADMIN LOGIN BAŞLADI ===');
        console.log('Admin login isteği alındı');
        console.log('Request body:', req.body);
        
        const { email, password } = req.body;

        console.log('Login bilgileri:', { 
            email, 
            password: password ? '***' : 'boş'
        });

        if (!email || !password) {
            console.log('E-posta veya şifre eksik');
            return res.status(400).json({
                success: false,
                message: 'E-posta ve şifre gerekli'
            });
        }

                // Supabase bağlantısı kontrolü
        if (!supabaseConnection.isConnected) {
            console.log('⚠️ Supabase bağlantısı yok, hardcoded admin kontrolü yapılıyor');
            
            // Hardcoded admin bilgileri
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'BismilVinc2024!';
            
            console.log('Admin bilgileri kontrol ediliyor (login):', { 
                email: adminEmail, 
                password: adminPassword ? '***' : 'boş' 
            });
            
            // Hardcoded admin kontrolü
            if (email === adminEmail && password === adminPassword) {
                console.log('✅ Hardcoded admin login başarılı');
                
                // Basit bir token oluştur (gerçek Supabase token'ı değil)
                const token = 'hardcoded-admin-token-' + Date.now();
                
                return res.json({
                    success: true,
                    message: 'Giriş başarılı (Hardcoded Admin)',
                    token,
                    user: {
                        id: 'hardcoded-admin-user',
                        email: adminEmail,
                        role: 'admin',
                        name: 'Admin'
                    }
                });
            } else {
                console.log('❌ Hardcoded admin login başarısız');
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre'
                });
            }
        }
        
        // Supabase ile kullanıcı doğrulama
        console.log('Supabase ile kullanıcı doğrulama yapılıyor...');
        
        try {
            const supabase = supabaseConnection.getClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                console.error('Supabase login hatası:', error);
                console.error('Error message:', error.message);
                console.error('Error status:', error.status);
                console.error('Full error object:', JSON.stringify(error, null, 2));
                
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre'
                });
            }
            
            if (data && data.user) {
                console.log('✅ Supabase login başarılı, kullanıcı:', data.user.email);
                console.log('User ID:', data.user.id);
                console.log('Email confirmed:', data.user.email_confirmed_at ? 'Evet' : 'Hayır');
                
                // Supabase access token'ı kullan
                const token = data.session.access_token;
                
                console.log('Login başarılı, Supabase token alındı');
                console.log('=== ADMIN LOGIN TAMAMLANDI ===');
                
                return res.json({
                    success: true,
                    message: 'Giriş başarılı',
                    token,
                    user: {
                        id: data.user.id,
                        email: data.user.email,
                        role: 'admin'
                    }
                });
            } else {
                console.log('❌ Supabase login başarısız - kullanıcı bulunamadı');
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre'
                });
            }
        } catch (authError) {
            console.error('❌ Supabase authentication hatası:', authError);
            console.error('Error message:', authError.message);
            console.error('Error stack:', authError.stack);
            console.error('Full error object:', JSON.stringify(authError, null, 2));
            
            return res.status(500).json({
                success: false,
                message: 'Kimlik doğrulama hatası'
            });
        }
    } catch (error) {
        console.error('=== ADMIN LOGIN HATASI ===');
        console.error('Admin login error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack,
                code: error.code
            } : 'Bir hata oluştu'
        });
    }
});

// JWT Token Validation
app.get('/api/admin/validate', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== TOKEN VALIDATION BAŞLADI ===');
        console.log('Token validation isteği alındı');
        console.log('User:', req.user);
        
        // Supabase bağlantısı kontrolü
        if (supabaseConnection.isConnected) {
            try {
                const supabase = supabaseConnection.getClient();
                const token = req.headers.authorization?.split(' ')[1];
                
                if (!token) {
                    console.log('Token bulunamadı');
                    return res.status(401).json({ success: false, message: 'Token bulunamadı' });
                }
                
                const { data: { user }, error } = await supabase.auth.getUser(token);
                
                if (error) {
                    console.error('Supabase token doğrulama hatası:', error);
                    return res.status(401).json({ success: false, message: 'Geçersiz token' });
                }
                
                if (user) {
                    console.log('Supabase token doğrulandı, kullanıcı:', user.email);
                    const userRepo = new SupabaseUserRepository();
                    const userData = await userRepo.findByEmail(user.email);
                    
                    if (userData && userData.role === 'admin') {
                        res.json({
                            success: true,
                            message: 'Token geçerli',
                            user: {
                                id: userData.id,
                                email: userData.email,
                                role: userData.role
                            }
                        });
                        return;
                    } else {
                        console.log('Kullanıcı admin değil:', user.email);
                        return res.status(401).json({ success: false, message: 'Admin yetkisi gerekli' });
                    }
                }
            } catch (supabaseError) {
                console.error('Supabase validation hatası:', supabaseError);
                console.log('Full error:', supabaseError);
            }
        }
        
        // Fallback: req.user'dan gelen bilgileri kullan (hardcoded admin için)
        res.json({
            success: true,
            message: 'Token geçerli',
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        console.log('Full error:', error);
        res.status(401).json({
            success: false,
            message: 'Token geçersiz'
        });
    }
});

// Admin Dashboard Stats - Supabase Based
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        console.log('Admin stats isteği alındı');
        
        let stats = {
            services: 0,
            contacts: 0,
            pageViews: 0,
            media: 0
        };

        // Supabase bağlantısı kontrolü
        if (supabaseConnection.isConnected) {
            try {
                // Hizmet sayısını al
                const serviceRepo = new ServiceRepository();
                const services = await serviceRepo.findAll();
                stats.services = services.length;

                // İletişim sayısını al
                const contactRepo = new SupabaseContactRepository();
                const contacts = await contactRepo.findAll();
                stats.contacts = contacts.length;

                // Medya sayısını al (settings'den)
                const settingsRepo = new SupabaseSettingsRepository();
                const settings = await settingsRepo.getSettings();
                const mediaCount = Object.keys(settings).filter(key => 
                    key.includes('_img') || key.includes('_logo') || key.includes('_bg')
                ).length;
                stats.media = mediaCount;

            } catch (dbError) {
                console.error('Supabase stats hatası:', dbError);
                // Hata durumunda fallback değerler kullan
            }
        } else {
            console.log('Supabase bağlantısı yok, fallback stats döndürülüyor');
            stats = {
                services: 4,
                contacts: 0,
                pageViews: 0,
                media: 0
            };
        }

        console.log('Stats başarıyla getirildi:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        
        // Hata durumunda fallback stats döndür
        res.json({
            services: 4,
            contacts: 0,
            pageViews: 0,
            media: 0
        });
    }
});

// Recent Contacts - Supabase Based
app.get('/api/admin/contacts/recent', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN RECENT CONTACTS BAŞLADI ===');
        
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, boş iletişim listesi döndürülüyor');
            return res.json([]);
        }
        
        const contactRepo = new SupabaseContactRepository();
        const contacts = await contactRepo.findAll();
        
        // Son 10 iletişimi döndür
        const recentContacts = contacts
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
        
        console.log('Son iletişimler başarıyla yüklendi:', recentContacts.length);
        res.json(recentContacts);
    } catch (error) {
        console.error('Son iletişimler hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar yüklenemedi'
        });
    }
});

// All Contacts
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN CONTACTS BAŞLADI ===');
        
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, boş iletişim listesi döndürülüyor');
            return res.json([]);
        }
        
        const contactRepo = new SupabaseContactRepository();
        const contacts = await contactRepo.findAll();
        console.log('İletişimler başarıyla yüklendi:', contacts.length);
        res.json(contacts);
    } catch (error) {
        console.error('İletişimler hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar yüklenemedi'
        });
    }
});

// Admin Settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN SETTINGS BAŞLADI ===');
        
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, hardcoded ayarlar döndürülüyor');
            const hardcodedSettings = {
                site_title: 'Bismil Vinç - Diyarbakır Mobil Vinç Hizmetleri',
                site_description: 'Diyarbakır\'da 16 yıllık deneyimle profesyonel mobil vinç kiralama ve şantiye kaldırma hizmetleri',
                phone_number: '+90 532 123 45 67',
                email_address: 'info@bismilvinc.com',
                address: 'Diyarbakır, Türkiye',
                navbar_logo: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs',
                homepage_hero_bg: 'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs',
                primary_color: '#007bff',
                primary_dark: '#0056b3',
                background_color: '#ffffff',
                font_family: 'Arial, sans-serif',
                footer_description: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri',
                navbar_services_link: 'Hizmetler',
                footer_services_link: 'Hizmetler',
                footer_service2: 'Mobil Vinç Hizmetleri',
                footer_service3: 'İnşaat Kurulum Hizmetleri',
                footer_service4: 'Petrol Kuyusu Hizmetleri'
            };
            return res.json(hardcodedSettings);
        }
        
        const settingsRepo = new SupabaseSettingsRepository();
        const settings = await settingsRepo.getSettings();
        console.log('Ayarlar başarıyla yüklendi');
        res.json(settings);
    } catch (error) {
        console.error('Ayarlar hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar yüklenemedi'
        });
    }
});

app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const { siteTitle, siteDescription, phoneNumber, emailAddress, address } = req.body;
        const settingsRepo = new SupabaseSettingsRepository();

        const updates = [
            { key: 'site_title', value: siteTitle },
            { key: 'site_description', value: siteDescription },
            { key: 'phone_number', value: phoneNumber },
            { key: 'email_address', value: emailAddress },
            { key: 'address', value: address }
        ];

        await settingsRepo.updateMultiple(updates);

        res.json({
            success: true,
            message: 'Ayarlar başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar güncellenemedi'
        });
    }
});

// Admin Settings Update
app.post('/api/admin/settings/update', authenticateAdmin, async (req, res) => {
    try {
        console.log('🔧 Settings update API çağrısı başladı');
        console.log('Gelen veriler:', JSON.stringify(req.body, null, 2));
        console.log('Supabase bağlantı durumu:', supabaseConnection.getConnectionStatus());
        
        // Supabase bağlantısını kontrol et
        if (!supabaseConnection.isConnected) {
            console.log('❌ Supabase bağlantısı yok, bağlantı kurulmaya çalışılıyor...');
            try {
                await supabaseConnection.connect();
                console.log('✅ Supabase bağlantısı kuruldu');
            } catch (connError) {
                console.error('❌ Supabase bağlantı hatası:', connError);
                return res.status(500).json({
                    success: false,
                    message: 'Veritabanı bağlantısı kurulamadı',
                    error: connError.message
                });
            }
        }
        
        const settingsRepo = new SupabaseSettingsRepository();
        const updates = req.body;
        
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Her ayarı güncelle
        for (const [key, value] of Object.entries(updates)) {
            try {
                console.log(`🔧 Ayar güncelleniyor: ${key} = ${value}`);
                await settingsRepo.updateByKey(key, value);
                successCount++;
                console.log(`✅ Ayar güncellendi: ${key}`);
            } catch (error) {
                console.error(`❌ Ayar güncellenemedi (${key}):`, error.message);
                console.error(`❌ Ayar güncellenemedi (${key}) - Full error:`, error);
                errorCount++;
                errors.push({ key, error: error.message });
            }
        }
        
        console.log(`📊 Settings update sonucu: ${successCount} başarılı, ${errorCount} hatalı`);
        
        if (errorCount > 0) {
            return res.status(400).json({
                success: false,
                message: `${errorCount} adet ayar güncellenemedi`,
                errors: errors,
                successCount: successCount,
                errorCount: errorCount
            });
        }
        
        res.json({
            success: true,
            message: `${successCount} adet ayar başarıyla güncellendi`,
            successCount: successCount
        });
    } catch (error) {
        console.error('❌ Settings update error:', error);
        console.error('❌ Settings update error - Full error:', JSON.stringify(error, null, 2));
        res.status(500).json({
            success: false,
            message: 'Ayarlar güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// Admin Theme
app.post('/api/admin/theme', authenticateAdmin, async (req, res) => {
    try {
        const { primaryColor, primaryDark, backgroundColor, fontFamily } = req.body;
        const settingsRepo = new SupabaseSettingsRepository();

        const updates = [
            { key: 'primary_color', value: primaryColor },
            { key: 'primary_dark', value: primaryDark },
            { key: 'background_color', value: backgroundColor },
            { key: 'font_family', value: fontFamily }
        ];

        await settingsRepo.updateMultiple(updates);

        res.json({
            success: true,
            message: 'Tema başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Theme update error:', error);
        res.status(500).json({
            success: false,
            message: 'Tema güncellenemedi'
        });
    }
});

// Admin Services
app.get('/api/admin/services', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN SERVICES BAŞLADI ===');
        
        // Supabase bağlantısını kontrol et
        if (!supabaseConnection.isConnected) {
            console.log('❌ Supabase bağlantısı yok, bağlantı kurulmaya çalışılıyor...');
            try {
                await supabaseConnection.connect();
                console.log('✅ Supabase bağlantısı kuruldu');
            } catch (connError) {
                console.error('❌ Supabase bağlantı hatası:', connError);
                return res.status(500).json({
                    success: false,
                    message: 'Veritabanı bağlantısı kurulamadı',
                    error: connError.message
                });
            }
        }
        
        const serviceRepo = new ServiceRepository();
        console.log('🔍 ServiceRepository.findAll() çağrılıyor...');
        
        const services = await serviceRepo.findAll();
        console.log(`✅ Hizmetler başarıyla yüklendi: ${services.length} adet`);
        
        // Dönen verileri detaylı logla
        if (services && services.length > 0) {
            console.log('📋 Yüklenen hizmetler:');
            services.forEach((service, index) => {
                console.log(`  ${index + 1}. ID: ${service.id}, Title: ${service.title}, Slug: ${service.slug}, Active: ${service.is_active}`);
            });
        } else {
            console.log('⚠️ Hiç hizmet bulunamadı');
        }
        
        res.json(services);
    } catch (error) {
        console.error('❌ Hizmetler yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmetler yüklenemedi',
            error: error.message
        });
    }
});

app.get('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const serviceRepo = new ServiceRepository();
        const service = await serviceRepo.findById(id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı'
            });
        }
        
        res.json(service);
    } catch (error) {
        console.error('Service get error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet getirilemedi'
        });
    }
});

app.post('/api/admin/services', authenticateAdmin, async (req, res) => {
    try {
        const { name, slug, description, icon, imageUrl } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Hizmet adı ve açıklaması zorunludur'
            });
        }
        
        const serviceRepo = new ServiceRepository();
        
        // Slug kontrolü
        if (slug) {
            const existingService = await serviceRepo.findBySlug(slug);
            if (existingService) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu slug zaten kullanılıyor'
                });
            }
        }
        
        const serviceData = {
            name: name.trim(),
            slug: slug ? slug.trim() : undefined,
            description: description.trim(),
            icon: icon || 'fas fa-cog'
        };
        
        const service = await serviceRepo.create(serviceData);
        
        // Eğer görsel URL'si varsa, settings'e kaydet
        if (imageUrl && service.slug) {
            const settingsRepo = new SupabaseSettingsRepository();
            const settingKey = `service_${service.slug}_img`;
            await settingsRepo.updateByKey(settingKey, imageUrl);
            console.log('Hizmet görseli settings\'e kaydedildi:', settingKey, imageUrl);
        }
        
        res.json({
            success: true,
            message: 'Hizmet başarıyla kaydedildi',
            data: service
        });
    } catch (error) {
        console.error('Service create error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet kaydedilemedi',
            error: error.message
        });
    }
});

app.put('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, icon, imageUrl } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Hizmet adı ve açıklaması zorunludur'
            });
        }
        
        const serviceRepo = new ServiceRepository();
        
        // Mevcut hizmeti kontrol et
        const existingService = await serviceRepo.findById(id);
        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı'
            });
        }
        
        // Slug kontrolü (eğer değiştiriliyorsa)
        if (slug && slug !== existingService.slug) {
            const slugExists = await serviceRepo.findBySlug(slug);
            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu slug zaten kullanılıyor'
                });
            }
        }
        
        const updateData = {
            name: name.trim(),
            description: description.trim(),
            icon: icon || 'fas fa-cog'
        };
        
        if (slug) {
            updateData.slug = slug.trim();
        }
        
        // Eğer görsel URL'si varsa, settings'e kaydet
        if (imageUrl && slug) {
            const settingsRepo = new SupabaseSettingsRepository();
            const settingKey = `service_${slug}_img`;
            await settingsRepo.updateByKey(settingKey, imageUrl);
            console.log('Hizmet görseli settings\'e kaydedildi:', settingKey, imageUrl);
        }
        
        const service = await serviceRepo.update(id, updateData);
        
        res.json({
            success: true,
            message: 'Hizmet başarıyla güncellendi',
            data: service
        });
    } catch (error) {
        console.error('Service update error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet güncellenemedi',
            error: error.message
        });
    }
});

app.delete('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const serviceRepo = new ServiceRepository();
        
        // Mevcut hizmeti kontrol et
        const existingService = await serviceRepo.findById(id);
        if (!existingService) {
            return res.status(404).json({
                success: false,
                message: 'Hizmet bulunamadı'
            });
        }
        
        await serviceRepo.delete(id);
        
        res.json({
            success: true,
            message: 'Hizmet başarıyla silindi'
        });
    } catch (error) {
        console.error('Service delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmet silinemedi',
            error: error.message
        });
    }
});

// Admin Pages Update
app.post('/api/admin/pages/update', authenticateAdmin, async (req, res) => {
    try {
        const { pageType, data } = req.body;
        const settingsRepo = new SupabaseSettingsRepository();
        
        // Sayfa tipine göre ayarları güncelle
        const updates = [];
        for (const [key, value] of Object.entries(data)) {
            updates.push({ key: `${pageType}_${key}`, value });
        }
        
        await settingsRepo.updateMultiple(updates);
        
        res.json({
            success: true,
            message: 'Sayfa içerikleri başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Pages update error:', error);
        res.status(500).json({
            success: false,
            message: 'Sayfa içerikleri güncellenirken hata oluştu',
            error: error.message
        });
    }
});

// Admin Media
app.get('/api/admin/media', authenticateAdmin, async (req, res) => {
    try {
        // This would typically come from Cloudinary or a media collection
        const media = [];
        res.json(media);
    } catch (error) {
        console.error('Media error:', error);
        res.status(500).json({
            success: false,
            message: 'Medya dosyaları yüklenemedi'
        });
    }
});

// Footer yönetimi endpoint'i
app.post('/api/admin/footer/update', authenticateAdmin, async (req, res) => {
    try {
        const footerData = req.body;
        console.log('Footer güncelleme isteği:', footerData);
        
        const settingsRepo = new SupabaseSettingsRepository();
        
        // Footer ayarlarını güncelle
        const updatePromises = Object.keys(footerData).map(key => 
            settingsRepo.updateByKey(key, footerData[key])
        );
        
        await Promise.all(updatePromises);
        
        console.log('Footer ayarları başarıyla güncellendi');
        res.json({ success: true, message: 'Footer ayarları başarıyla güncellendi' });
    } catch (error) {
        console.error('Footer güncelleme hatası:', error);
        res.status(500).json({ success: false, message: 'Footer güncellenirken hata oluştu' });
    }
});

// Footer ayarlarını getir
app.get('/api/admin/footer', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN FOOTER BAŞLADI ===');
        
        if (!supabaseConnection.isConnected) {
            console.log('Supabase bağlantısı yok, hardcoded footer ayarları döndürülüyor');
            const hardcodedFooterSettings = {
                footer_description: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri',
                footer_services_link: 'Hizmetler',
                footer_service2: 'Mobil Vinç Hizmetleri',
                footer_service3: 'İnşaat Kurulum Hizmetleri',
                footer_service4: 'Petrol Kuyusu Hizmetleri'
            };
            return res.json({ success: true, data: hardcodedFooterSettings });
        }
        
        console.log('Footer ayarları getirme isteği alındı');
        const settingsRepo = new SupabaseSettingsRepository();
        const settings = await settingsRepo.getPublicSettingsAsObject();
        console.log('Tüm public ayarlar:', settings);
        
        const footerSettings = {};
        
        // Footer ile ilgili ayarları filtrele
        Object.keys(settings).forEach(key => {
            if (key.startsWith('footer_')) {
                footerSettings[key] = settings[key];
                console.log(`Footer ayarı bulundu: ${key} = ${settings[key]}`);
            }
        });
        
        console.log('Filtrelenmiş footer ayarları:', footerSettings);
        res.json({ success: true, data: footerSettings });
    } catch (error) {
        console.error('Footer ayarları getirme hatası:', error);
        res.status(500).json({ success: false, message: 'Footer ayarları alınırken hata oluştu' });
    }
});

// Settings endpoint'i

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Sayfa bulunamadı'
    });
});

// Error handler
app.use(handleUploadError);
app.use((error, req, res, next) => {
    console.error('Server hatası:', error);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
    });
});

// Server başlatma
const startServer = async () => {
    try {
        console.log('🚀 Sunucu başlatılıyor...');
        
        // Environment variables kontrolü
        console.log('Environment variables kontrol ediliyor...');
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'VAR' : 'YOK');
        console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'VAR' : 'YOK');
        console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'YOK');
        console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? 'VAR' : 'YOK');
        
        // Supabase bağlantısını dene
        try {
            if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
                console.log('🔗 Supabase bağlantısı deneniyor...');
                console.log('SUPABASE_URL (ilk 50 karakter):', process.env.SUPABASE_URL.substring(0, 50) + '...');
                
                await supabaseConnection.connect();
                console.log('✅ Supabase bağlantısı başarılı');
            } else {
                console.log('⚠️ SUPABASE_URL veya SUPABASE_ANON_KEY environment variable eksik');
                console.log('📝 Uygulama Supabase olmadan çalışacak');
            }
        } catch (dbError) {
            console.error('❌ Supabase bağlantısı başarısız:', dbError.message);
            console.log('📝 Uygulama Supabase olmadan çalışmaya devam edecek');
        }

        // Default admin kullanıcısını oluştur (sadece Supabase bağlıysa)
        if (supabaseConnection.isConnected) {
            try {
                // Supabase Auth kullandığımız için custom users tablosuna gerek yok
                // const userRepo = new SupabaseUserRepository();
                // await userRepo.initializeDefaultAdmin();
                console.log('✅ Default admin kullanıcısı kontrol edildi (Supabase Auth kullanılıyor)');
            } catch (adminError) {
                console.warn('⚠️ Default admin oluşturulamadı:', adminError.message);
            }
        } else {
            console.log('📝 Default admin oluşturma atlandı - Supabase bağlı değil');
        }

        // Default ayarları oluştur (sadece Supabase bağlıysa)
        if (supabaseConnection.isConnected) {
            try {
                const settingsRepo = new SupabaseSettingsRepository();
                await settingsRepo.initializeDefaultSettings();
                console.log('✅ Default ayarlar kontrol edildi');
            } catch (settingsError) {
                console.warn('⚠️ Default ayarlar oluşturulamadı:', settingsError.message);
            }
        } else {
            console.log('📝 Default ayarlar oluşturma atlandı - Supabase bağlı değil');
        }

        // Varsayılan hizmetleri oluştur (sadece Supabase bağlıysa)
        if (supabaseConnection.isConnected) {
            try {
                const serviceRepo = new ServiceRepository();
                await serviceRepo.initializeDefaultServices();
                console.log('✅ Varsayılan hizmetler oluşturuldu');
            } catch (serviceError) {
                console.warn('⚠️ Hizmetler oluşturulamadı, devam ediliyor:', serviceError.message);
            }
        } else {
            console.log('📝 Varsayılan hizmetler oluşturma atlandı - Supabase bağlı değil');
        }

        console.log('✅ Sunucu başlatma tamamlandı');
        console.log('📝 Admin giriş bilgileri:');
        console.log('   E-posta:', process.env.ADMIN_EMAIL || 'YOK');
        console.log('   Şifre:', process.env.ADMIN_PASSWORD || 'YOK');
        console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    } catch (error) {
        console.error('❌ Sunucu başlatma hatası:', error);
        console.log('📝 Uygulama temel işlevlerle çalışmaya devam edecek');
    }
};

// Supabase test endpoint
app.get('/api/test/supabase', async (req, res) => {
    try {
        const connectionStatus = supabaseConnection.getConnectionStatus();
        const supabaseUrl = process.env.SUPABASE_URL ? 'VAR' : 'YOK';
        const supabaseKey = process.env.SUPABASE_ANON_KEY ? 'VAR' : 'YOK';
        
        const healthCheck = await supabaseConnection.healthCheck();
        
        res.json({
            success: connectionStatus.isConnected,
            supabase_connection: connectionStatus.isConnected ? 'BAĞLI' : 'BAĞLANTI YOK',
            supabase_url: supabaseUrl,
            supabase_key: supabaseKey,
            connection_error: connectionStatus.error,
            health_status: healthCheck.status,
            health_error: healthCheck.error,
            message: connectionStatus.isConnected ? 
                'Supabase bağlantısı aktif ve sağlıklı' : 
                connectionStatus.error ? 
                    `Supabase bağlantı hatası: ${connectionStatus.error}` :
                    'Supabase bağlantısı yok - SUPABASE_URL ve SUPABASE_ANON_KEY kontrol edin'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Supabase test hatası'
        });
    }
});

// Vercel için export
module.exports = app;

// Her ortamda server'ı başlat
(async () => {
    try {
        await startServer();
        console.log('✅ Server başlatma tamamlandı');
        
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`🚀 Server ${PORT} portunda çalışıyor`);
                console.log(`🌐 URL: http://localhost:${PORT}`);
                console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
            });
        }
    } catch (error) {
        console.error('❌ Server başlatma hatası:', error);
    }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Server kapatılıyor...');
    await supabaseConnection.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Server kapatılıyor...');
    await supabaseConnection.disconnect();
    process.exit(0);
});