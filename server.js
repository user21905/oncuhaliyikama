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

// Static dosyalar - Vercel için düzenlendi
if (process.env.NODE_ENV === 'production') {
    // Production'da sadece gerekli dosyaları serve et
    app.use('/admin', express.static(path.join(__dirname, 'admin')));
    app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')));
    app.use('/script.js', express.static(path.join(__dirname, 'script.js')));
    app.use('/navbar.js', express.static(path.join(__dirname, 'navbar.js')));
    app.use('/footer.js', express.static(path.join(__dirname, 'footer.js')));
} else {
    // Development'ta tüm dosyaları serve et
    app.use(express.static(__dirname));
}

// Admin Authentication Middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRepo = new UserRepository();
        const user = await userRepo.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Geçersiz token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Geçersiz token' });
    }
};

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
        const settingsRepo = new SettingsRepository();
        const settings = await settingsRepo.getPublicSettingsAsObject();
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Settings getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Ayarlar getirilemedi',
            error: error.message
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

        const cloudinaryService = require('./services/cloudinary');
        const settingsRepo = new SettingsRepository();
        const defaultFolder = await settingsRepo.getByKey('cloudinary_folder');
        const uploadFolder = folder || (defaultFolder ? defaultFolder.value : 'bismilvinc');

        console.log('Uploading to Cloudinary with folder:', uploadFolder);

        const result = await cloudinaryService.uploadBase64(base64Data, {
            folder: uploadFolder,
            public_id: fileName ? `${uploadFolder}/${Date.now()}_${fileName}` : undefined
        });

        console.log('Cloudinary upload result:', result);

        if (result.success && result.data && result.data.url) { // Changed from result.data.secure_url
            // İlgili ayarı güncelle
            await settingsRepo.updateByKey(targetField, result.data.url); // Changed from result.data.secure_url
            res.json({
                success: true,
                message: 'Görsel başarıyla yüklendi ve ayar güncellendi',
                url: result.data.url, // Changed from result.data.secure_url
                targetField
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error || 'Yükleme başarısız'
            });
        }
    } catch (error) {
        console.error('Admin medya yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Medya yüklenemedi',
            error: error.message
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'E-posta ve şifre gerekli'
            });
        }

        const userRepo = new UserRepository();
        const user = await userRepo.findByEmail(email);

        if (!user || user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz e-posta veya şifre'
            });
        }

        // Update last login
        await userRepo.update(user._id, { lastLogin: new Date() });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

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
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi başarısız'
        });
    }
});

// Validate Admin Token
app.get('/api/admin/validate', authenticateAdmin, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const contactRepo = new ContactRepository();
        const settingsRepo = new SettingsRepository();

        const [contacts, settings] = await Promise.all([
            contactRepo.getStats(),
            settingsRepo.getAll()
        ]);

        const stats = {
            services: 5, // Static for now, can be made dynamic
            contacts: contacts.total || 0,
            pageViews: 0, // Can be implemented with analytics
            media: 0 // Can be implemented with media count
        };

        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler yüklenemedi'
        });
    }
});

// Recent Contacts
app.get('/api/admin/contacts/recent', authenticateAdmin, async (req, res) => {
    try {
        const contactRepo = new ContactRepository();
        const contacts = await contactRepo.getRecentContacts(5);
        res.json(contacts);
    } catch (error) {
        console.error('Recent contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar yüklenemedi'
        });
    }
});

// All Contacts
app.get('/api/admin/contacts', authenticateAdmin, async (req, res) => {
    try {
        const contactRepo = new ContactRepository();
        const contacts = await contactRepo.findAll();
        res.json(contacts);
    } catch (error) {
        console.error('Contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar yüklenemedi'
        });
    }
});

// Admin Settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const settingsRepo = new SettingsRepository();
        const settings = await settingsRepo.getSettingsAsObject();
        res.json(settings);
    } catch (error) {
        console.error('Settings error:', error);
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
        const serviceRepo = new ServiceRepository();
        const services = await serviceRepo.findAll();
        res.json(services);
    } catch (error) {
        console.error('Services error:', error);
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
        // Database bağlantısı
        await databaseConnection.connect();
        console.log('✅ MongoDB bağlantısı başarılı');

        // Varsayılan ayarları yükle
        const settingsRepo = new SettingsRepository();
        await settingsRepo.initializeSettings();
        console.log('✅ Varsayılan ayarlar yüklendi');

        // Varsayılan admin kullanıcısını oluştur
        const userRepo = new UserRepository();
        await userRepo.initializeDefaultAdmin();
        console.log('✅ Varsayılan admin kullanıcısı oluşturuldu');

        // Varsayılan hizmetleri oluştur
        const serviceRepo = new ServiceRepository();
        await serviceRepo.initializeDefaultServices();
        console.log('✅ Varsayılan hizmetler oluşturuldu');

        console.log(`🚀 Server hazır`);
        console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    } catch (error) {
        console.error('❌ Server başlatma hatası:', error);
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