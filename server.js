const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database bağlantısı
const databaseConnection = require('./database/connection');
const mongooseConnection = require('./database/mongoose-connection');

// Repositories
const ContactRepository = require('./database/repositories/ContactRepository');
const SettingsRepository = require('./database/repositories/SettingsRepository');
const UserRepository = require('./database/repositories/UserRepository');
const ServiceRepository = require('./database/repositories/ServiceRepository');

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

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        console.log('=== AUTHENTICATE ADMIN BAŞLADI ===');
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('Token bulunamadı');
            return res.status(401).json({ success: false, message: 'Token bulunamadı' });
        }

        console.log('Token alındı, doğrulanıyor...');
        
        // JWT_SECRET kontrolü
        const jwtSecret = process.env.JWT_SECRET || 'bismil-vinc-fallback-secret-2024';
        
        const decoded = jwt.verify(token, jwtSecret);
        console.log('Token doğrulandı, kullanıcı bilgileri:', {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        });

        // MongoDB bağlantısı kontrolü
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, hardcoded admin kontrolü yapılıyor');
            
            // Hardcoded admin kontrolü
            const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
            
            if (decoded.email === defaultAdminEmail && decoded.role === 'admin') {
                console.log('Hardcoded admin token doğrulandı');
                req.user = {
                    _id: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                    name: 'Admin'
                };
                next();
                return;
            } else {
                console.log('Hardcoded admin token geçersiz');
                return res.status(401).json({ success: false, message: 'Geçersiz token' });
            }
        }

        // MongoDB bağlantısı varsa normal akış
        const userRepo = new UserRepository();
        const user = await userRepo.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            console.log('Kullanıcı bulunamadı veya admin değil');
            return res.status(401).json({ success: false, message: 'Geçersiz token' });
        }

        console.log('Admin kullanıcı doğrulandı:', user.email);
        req.user = user;
        next();
    } catch (error) {
        console.error('=== AUTHENTICATE ADMIN HATASI ===');
        console.error('Token doğrulama hatası:', error);
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
        
        // MongoDB bağlantısını kontrol et
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, fallback değerler döndürülüyor');
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
        
        const settingsRepo = new SettingsRepository();
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

        const contactRepo = new ContactRepository();
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
                id: result._id,
                timestamp: result.createdAt
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
        const settingsRepo = new SettingsRepository();
        
        const defaultFolder = await settingsRepo.getByKey('cloudinary_folder');
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
        const settingsRepo = new SettingsRepository();
        
        // MongoDB bağlantısı kontrolü
        console.log('MongoDB bağlantı durumu:', databaseConnection.isConnected);
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, sadece Cloudinary yükleme yapılacak');
        }
        
        // Default folder'ı al
        let defaultFolder;
        try {
            defaultFolder = await settingsRepo.getByKey('cloudinary_folder');
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
            if (databaseConnection.isConnected) {
                try {
                    console.log('Ayar güncelleniyor:', targetField);
                    await settingsRepo.updateByKey(targetField, result.data.url);
                    console.log('Ayar başarıyla güncellendi');
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
            }
            
            res.json({
                success: true,
                message: 'Görsel başarıyla yüklendi ve ayar güncellendi',
                url: result.data.url,
                targetField
            });
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
        } else if (error.message.includes('MongoDB')) {
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
        
        const settingsRepo = new SettingsRepository();
        
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
        const dbHealth = await databaseConnection.healthCheck();
        
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

// Admin API Routes

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        console.log('=== ADMIN LOGIN BAŞLADI ===');
        console.log('Admin login isteği alındı');
        console.log('Request body:', req.body);
        
        // Environment variables kontrolü
        const jwtSecret = process.env.JWT_SECRET || 'bismil-vinc-fallback-secret-2024';
        const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@bismilvinc.com';
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        console.log('Environment variables:', {
            JWT_SECRET: process.env.JWT_SECRET ? 'VAR' : 'YOK (fallback kullanılıyor)',
            ADMIN_EMAIL: defaultAdminEmail,
            ADMIN_PASSWORD: defaultAdminPassword ? 'VAR' : 'YOK',
            NODE_ENV: process.env.NODE_ENV
        });
        
        const { email, password } = req.body;

        console.log('Login bilgileri:', { 
            email, 
            password: password ? '***' : 'boş',
            expectedEmail: defaultAdminEmail,
            emailMatch: email === defaultAdminEmail
        });

        if (!email || !password) {
            console.log('E-posta veya şifre eksik');
            return res.status(400).json({
                success: false,
                message: 'E-posta ve şifre gerekli'
            });
        }

        // MongoDB bağlantısı kontrolü
        const isDbConnected = databaseConnection.isConnected;
        console.log('MongoDB bağlantı durumu:', isDbConnected ? 'BAĞLI' : 'BAĞLI DEĞİL');

        if (!isDbConnected) {
            console.log('MongoDB bağlantısı yok, hardcoded admin kontrolü yapılıyor');
            
            console.log('Beklenen admin bilgileri:', { 
                email: defaultAdminEmail, 
                password: defaultAdminPassword ? '***' : 'boş' 
            });
            
            console.log('Karşılaştırma:', {
                emailMatch: email === defaultAdminEmail,
                passwordMatch: password === defaultAdminPassword
            });
            
            if (email === defaultAdminEmail && password === defaultAdminPassword) {
                console.log('Hardcoded admin girişi başarılı');
                
                // Generate JWT token
                const token = jwt.sign(
                    { 
                        userId: 'admin-user-id', 
                        email: email, 
                        role: 'admin' 
                    },
                    jwtSecret,
                    { expiresIn: '24h' }
                );

                console.log('Login başarılı, token oluşturuldu');
                console.log('Token örneği:', token.substring(0, 50) + '...');
                console.log('=== ADMIN LOGIN TAMAMLANDI ===');
                
                return res.json({
                    success: true,
                    message: 'Giriş başarılı',
                    token,
                    user: {
                        id: 'admin-user-id',
                        name: 'Admin',
                        email: email,
                        role: 'admin'
                    }
                });
            } else {
                console.log('Hardcoded admin bilgileri eşleşmedi');
                console.log('Girilen:', { email, password: '***' });
                console.log('Beklenen:', { email: defaultAdminEmail, password: '***' });
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz e-posta veya şifre'
                });
            }
        }

        // MongoDB bağlantısı varsa normal akış
        console.log('MongoDB bağlantısı var, veritabanından kullanıcı aranıyor');
        const userRepo = new UserRepository();
        console.log('Kullanıcı aranıyor:', email);
        
        const user = await userRepo.findByEmail(email);
        console.log('Kullanıcı bulundu mu:', !!user);
        console.log('Kullanıcı detayları:', user ? {
            email: user.email,
            role: user.role,
            isActive: user.isActive
        } : 'Kullanıcı bulunamadı');

        if (!user || user.role !== 'admin') {
            console.log('Kullanıcı bulunamadı veya admin değil');
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        console.log('Şifre kontrol ediliyor...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Şifre geçerli mi:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('Şifre geçersiz');
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        // Update last login
        try {
            await userRepo.update(user._id, { lastLogin: new Date() });
            console.log('Son giriş tarihi güncellendi');
        } catch (updateError) {
            console.warn('Son giriş tarihi güncellenemedi:', updateError.message);
        }

        // Generate JWT token
        console.log('JWT token oluşturuluyor...');
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '24h' }
        );

        console.log('Login başarılı, token oluşturuldu');
        console.log('Token örneği:', token.substring(0, 50) + '...');
        console.log('=== ADMIN LOGIN TAMAMLANDI ===');
        
        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('=== ADMIN LOGIN HATASI ===');
        console.error('Admin login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi başarısız',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Bir hata oluştu'
        });
    }
});

// JWT Token Validation
app.get('/api/admin/validate', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== TOKEN VALIDATION BAŞLADI ===');
        console.log('Token validation isteği alındı');
        console.log('User:', req.user);
        
        res.json({
            success: true,
            message: 'Token geçerli',
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({
            success: false,
            message: 'Token geçersiz'
        });
    }
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        console.log('Admin stats isteği alındı');
        
        // MongoDB bağlantısı kontrolü
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, fallback stats döndürülüyor');
            return res.json({
                services: 4,
                contacts: 0,
                pageViews: 0,
                media: 0
            });
        }

        const contactRepo = new ContactRepository();
        const settingsRepo = new SettingsRepository();

        const [contacts, settings] = await Promise.all([
            contactRepo.getStats(),
            settingsRepo.getAll()
        ]);

        const stats = {
            services: 4, // Static for now, can be made dynamic
            contacts: contacts.total || 0,
            pageViews: 0, // Can be implemented with analytics
            media: 0 // Can be implemented with media count
        };

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

// Recent Contacts
app.get('/api/admin/contacts/recent', authenticateAdmin, async (req, res) => {
    try {
        console.log('=== ADMIN RECENT CONTACTS BAŞLADI ===');
        
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, boş son iletişim listesi döndürülüyor');
            return res.json([]);
        }
        
        const contactRepo = new ContactRepository();
        const contacts = await contactRepo.getRecentContacts(5);
        console.log('Son iletişimler başarıyla yüklendi:', contacts.length);
        res.json(contacts);
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
        
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, boş iletişim listesi döndürülüyor');
            return res.json([]);
        }
        
        const contactRepo = new ContactRepository();
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
        
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, hardcoded ayarlar döndürülüyor');
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
        
        const settingsRepo = new SettingsRepository();
        const settings = await settingsRepo.getSettingsAsObject();
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
        const settingsRepo = new SettingsRepository();

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
        const settingsRepo = new SettingsRepository();
        const updates = req.body;
        
        // Her ayarı güncelle
        for (const [key, value] of Object.entries(updates)) {
            await settingsRepo.updateByKey(key, value);
        }
        
        res.json({
            success: true,
            message: 'Ayarlar başarıyla güncellendi'
        });
    } catch (error) {
        console.error('Settings update error:', error);
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
        const settingsRepo = new SettingsRepository();

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
        
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, hardcoded hizmetler döndürülüyor');
            const hardcodedServices = [
                {
                    _id: '1',
                    name: 'Mobil Vinç Hizmetleri',
                    slug: 'mobilvinchizmeti',
                    description: 'Diyarbakır\'da yüksek kapasiteli mobil vinç kiralama hizmetleri',
                    icon: 'fas fa-truck',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: '2',
                    name: 'İnşaat Kurulum Hizmetleri',
                    slug: 'insaatkurulumu',
                    description: 'İnşaat projeleriniz için kapsamlı kurulum hizmetleri',
                    icon: 'fas fa-building',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: '3',
                    name: 'Petrol Kuyusu Hizmetleri',
                    slug: 'petrolkuyuhizmeti',
                    description: 'Petrol sahalarında profesyonel vinç hizmetleri',
                    icon: 'fas fa-oil-can',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    _id: '4',
                    name: 'Petrol ve İnşaat Sahası Hizmetleri',
                    slug: 'petrolinsaatsahasi',
                    description: 'Petrol ve inşaat sahalarında kapsamlı vinç hizmetleri',
                    icon: 'fas fa-industry',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            console.log('Hardcoded hizmetler döndürülüyor:', hardcodedServices.length, 'adet');
            return res.json(hardcodedServices);
        }
        
        const serviceRepo = new ServiceRepository();
        const services = await serviceRepo.findAll();
        console.log('Hizmetler başarıyla yüklendi:', services.length);
        res.json(services);
    } catch (error) {
        console.error('Hizmetler hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Hizmetler yüklenemedi'
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
            const settingsRepo = new SettingsRepository();
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
            const settingsRepo = new SettingsRepository();
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
        const settingsRepo = new SettingsRepository();
        
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
        
        const settingsRepo = new SettingsRepository();
        
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
        
        if (!databaseConnection.isConnected) {
            console.log('MongoDB bağlantısı yok, hardcoded footer ayarları döndürülüyor');
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
        const settingsRepo = new SettingsRepository();
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
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'VAR' : 'YOK');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'VAR' : 'YOK');
        console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'admin@bismilvinc.com');
        console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD ? 'VAR' : 'YOK');
        
        // MongoDB bağlantısını dene
        try {
            if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
                await databaseConnection.connect();
                console.log('✅ MongoDB bağlantısı başarılı');
            } else {
                console.log('⚠️ MONGODB_URI ayarlanmamış veya placeholder değer');
                console.log('📝 Uygulama MongoDB olmadan çalışacak');
            }
        } catch (dbError) {
            console.warn('⚠️ MongoDB bağlantısı başarısız:', dbError.message);
            console.log('📝 Uygulama MongoDB olmadan çalışmaya devam edecek');
        }

        // Mongoose bağlantısını dene
        try {
            if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
                await mongooseConnection.connect();
                console.log('✅ Mongoose bağlantısı başarılı');
            } else {
                console.log('⚠️ Mongoose bağlantısı atlandı - MONGODB_URI yok');
            }
        } catch (mongooseError) {
            console.warn('⚠️ Mongoose bağlantısı başarısız:', mongooseError.message);
            console.log('📝 Uygulama Mongoose olmadan çalışmaya devam edecek');
        }

        // Default admin kullanıcısını oluştur (sadece MongoDB bağlıysa)
        if (databaseConnection.isConnected) {
            try {
                const userRepo = new UserRepository();
                await userRepo.initializeDefaultAdmin();
                console.log('✅ Default admin kullanıcısı kontrol edildi');
            } catch (adminError) {
                console.warn('⚠️ Default admin oluşturulamadı:', adminError.message);
            }
        } else {
            console.log('📝 Default admin oluşturma atlandı - MongoDB bağlı değil');
        }

        // Default ayarları oluştur (sadece MongoDB bağlıysa)
        if (databaseConnection.isConnected) {
            try {
                const settingsRepo = new SettingsRepository();
                await settingsRepo.initializeDefaultSettings();
                console.log('✅ Default ayarlar kontrol edildi');
            } catch (settingsError) {
                console.warn('⚠️ Default ayarlar oluşturulamadı:', settingsError.message);
            }
        } else {
            console.log('📝 Default ayarlar oluşturma atlandı - MongoDB bağlı değil');
        }

        // Varsayılan hizmetleri oluştur (sadece MongoDB bağlıysa)
        if (databaseConnection.isConnected) {
            try {
                const serviceRepo = new ServiceRepository();
                await serviceRepo.initializeDefaultServices();
                console.log('✅ Varsayılan hizmetler oluşturuldu');
            } catch (serviceError) {
                console.warn('⚠️ Hizmetler oluşturulamadı, devam ediliyor:', serviceError.message);
            }
        } else {
            console.log('📝 Varsayılan hizmetler oluşturma atlandı - MongoDB bağlı değil');
        }

        console.log('✅ Sunucu başlatma tamamlandı');
        console.log('📝 Admin giriş bilgileri:');
        console.log('   E-posta:', process.env.ADMIN_EMAIL || 'admin@bismilvinc.com');
        console.log('   Şifre:', process.env.ADMIN_PASSWORD || 'admin123');
        console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    } catch (error) {
        console.error('❌ Sunucu başlatma hatası:', error);
        console.log('📝 Uygulama temel işlevlerle çalışmaya devam edecek');
    }
};

// Vercel için export
module.exports = app;

// Development ortamında server'ı başlat
if (process.env.NODE_ENV !== 'production') {
    startServer().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server ${PORT} portunda çalışıyor`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
        });
    });
} else {
    // Production ortamında sadece başlat
    startServer();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Server kapatılıyor...');
    await mongooseConnection.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Server kapatılıyor...');
    await mongooseConnection.disconnect();
    process.exit(0);
});