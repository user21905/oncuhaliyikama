const { ObjectId } = require('mongodb');

class Settings {
    constructor(data) {
        this._id = data._id || new ObjectId();
        this.key = data.key;
        this.value = data.value;
        this.type = data.type || 'string'; // string, number, boolean, json
        this.category = data.category || 'general'; // general, company, contact, social, seo
        this.description = data.description || '';
        this.isPublic = data.isPublic || false;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static get collectionName() {
        return 'settings';
    }

    toJSON() {
        return {
            _id: this._id,
            key: this.key,
            value: this.value,
            type: this.type,
            category: this.category,
            description: this.description,
            isPublic: this.isPublic,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static getDefaultSettings() {
        return [
            // Company Information
            {
                key: 'company_name',
                value: 'Bismil Vinç',
                type: 'string',
                category: 'company',
                description: 'Şirket adı',
                isPublic: true
            },
            {
                key: 'company_phone',
                value: '0555 123 45 67',
                type: 'string',
                category: 'company',
                description: 'Şirket telefon numarası',
                isPublic: true
            },
            {
                key: 'company_email',
                value: 'info@bismilvinc.com',
                type: 'string',
                category: 'company',
                description: 'Şirket e-posta adresi',
                isPublic: true
            },
            {
                key: 'company_address',
                value: 'Bismil, Diyarbakır, Türkiye',
                type: 'string',
                category: 'company',
                description: 'Şirket adresi',
                isPublic: true
            },
            {
                key: 'company_coordinates',
                value: JSON.stringify({ lat: 37.842249, lng: 40.669449 }),
                type: 'json',
                category: 'company',
                description: 'Şirket koordinatları',
                isPublic: true
            },

            // Website Configuration
            {
                key: 'site_title',
                value: 'Bismil Vinç - Mobil Vinç ve Kurulum Hizmetleri',
                type: 'string',
                category: 'seo',
                description: 'Site başlığı',
                isPublic: true
            },
            {
                key: 'site_description',
                value: 'Diyarbakır\'da profesyonel mobil vinç, platform lift ve inşaat kurulum hizmetleri. Güvenli ve deneyimli ekipman kiralama.',
                type: 'string',
                category: 'seo',
                description: 'Site açıklaması',
                isPublic: true
            },
            {
                key: 'site_url',
                value: 'https://bismilvinc.com',
                type: 'string',
                category: 'general',
                description: 'Site URL\'si',
                isPublic: true
            },

            // Contact Information
            {
                key: 'emergency_phone',
                value: '0555 123 45 67',
                type: 'string',
                category: 'contact',
                description: 'Acil durum telefon numarası',
                isPublic: true
            },
            {
                key: 'emergency_available',
                value: 'true',
                type: 'boolean',
                category: 'contact',
                description: '7/24 hizmet durumu',
                isPublic: true
            },
            {
                key: 'operating_hours',
                value: JSON.stringify({
                    start: '00:00',
                    end: '23:59',
                    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                }),
                type: 'json',
                category: 'contact',
                description: 'Çalışma saatleri',
                isPublic: true
            },

            // Social Media
            {
                key: 'facebook_url',
                value: 'https://facebook.com/bismilvinc',
                type: 'string',
                category: 'social',
                description: 'Facebook sayfası',
                isPublic: true
            },
            {
                key: 'instagram_url',
                value: 'https://instagram.com/bismilvinc',
                type: 'string',
                category: 'social',
                description: 'Instagram sayfası',
                isPublic: true
            },
            {
                key: 'twitter_url',
                value: 'https://twitter.com/bismilvinc',
                type: 'string',
                category: 'social',
                description: 'Twitter sayfası',
                isPublic: true
            },
            {
                key: 'linkedin_url',
                value: 'https://linkedin.com/company/bismilvinc',
                type: 'string',
                category: 'social',
                description: 'LinkedIn sayfası',
                isPublic: true
            },

            // Services
            {
                key: 'service_areas',
                value: JSON.stringify(['Diyarbakır', 'Bismil', 'Çınar', 'Ergani', 'Silvan']),
                type: 'json',
                category: 'services',
                description: 'Hizmet verilen alanlar',
                isPublic: true
            },
            {
                key: 'service_radius_km',
                value: '100',
                type: 'number',
                category: 'services',
                description: 'Hizmet yarıçapı (km)',
                isPublic: true
            },

            // Analytics
            {
                key: 'google_analytics_id',
                value: '',
                type: 'string',
                category: 'analytics',
                description: 'Google Analytics Tracking ID',
                isPublic: false
            },
            {
                key: 'facebook_pixel_id',
                value: '',
                type: 'string',
                category: 'analytics',
                description: 'Facebook Pixel ID',
                isPublic: false
            },

            // Email Configuration
            {
                key: 'emailjs_public_key',
                value: '',
                type: 'string',
                category: 'email',
                description: 'EmailJS Public Key',
                isPublic: false
            },
            {
                key: 'emailjs_service_id',
                value: '',
                type: 'string',
                category: 'email',
                description: 'EmailJS Service ID',
                isPublic: false
            },
            {
                key: 'emailjs_template_id',
                value: '',
                type: 'string',
                category: 'email',
                description: 'EmailJS Template ID',
                isPublic: false
            },

            // Cloudinary Configuration
            {
                key: 'cloudinary_cloud_name',
                value: '',
                type: 'string',
                category: 'cloudinary',
                description: 'Cloudinary Cloud Name',
                isPublic: false
            },
            {
                key: 'cloudinary_api_key',
                value: '',
                type: 'string',
                category: 'cloudinary',
                description: 'Cloudinary API Key',
                isPublic: false
            },
            {
                key: 'cloudinary_api_secret',
                value: '',
                type: 'string',
                category: 'cloudinary',
                description: 'Cloudinary API Secret',
                isPublic: false
            },
            {
                key: 'cloudinary_upload_preset',
                value: 'bismilvinc_uploads',
                type: 'string',
                category: 'cloudinary',
                description: 'Cloudinary Upload Preset',
                isPublic: false
            },
            {
                key: 'cloudinary_folder',
                value: 'bismilvinc',
                type: 'string',
                category: 'cloudinary',
                description: 'Cloudinary Ana Klasör',
                isPublic: false
            },
            {
                key: 'cloudinary_max_file_size',
                value: '10485760',
                type: 'number',
                category: 'cloudinary',
                description: 'Maksimum Dosya Boyutu (byte)',
                isPublic: false
            },
            {
                key: 'cloudinary_allowed_formats',
                value: JSON.stringify(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
                type: 'json',
                category: 'cloudinary',
                description: 'İzin Verilen Dosya Formatları',
                isPublic: false
            },
            // --- DİNAMİK GÖRSELLER ---
            {
                key: 'homepage_hero_bg',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Anasayfa hero arka plan görseli (URL)',
                isPublic: true
            },
            {
                key: 'navbar_logo',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Navbar logo görseli (URL)',
                isPublic: true
            },
            {
                key: 'service_mobilvinchizmeti_img',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Mobil Vinç Hizmeti ana görseli (URL)',
                isPublic: true
            },
            {
                key: 'service_platformlifthizmeti_img',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Platform Lift Hizmeti ana görseli (URL)',
                isPublic: true
            },
            {
                key: 'service_insaatkurulumu_img',
                value: '',
                type: 'string',
                category: 'media',
                description: 'İnşaat Kurulum Hizmeti ana görseli (URL)',
                isPublic: true
            },
            {
                key: 'service_petrolkuyuhizmeti_img',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Petrol Kuyusu Hizmeti ana görseli (URL)',
                isPublic: true
            },
            {
                key: 'service_petrolinsaatsahasi_img',
                value: '',
                type: 'string',
                category: 'media',
                description: 'Petrol ve İnşaat Sahası Hizmeti ana görseli (URL)',
                isPublic: true
            },
            // Contact settings
            { key: 'phone_number', value: '0555 123 45 67', category: 'contact', description: 'Telefon numarası', isPublic: true },
            { key: 'whatsapp_number', value: '0555 123 45 67', category: 'contact', description: 'WhatsApp numarası', isPublic: true },
            { key: 'email_address', value: 'info@bismilvinc.com', category: 'contact', description: 'E-posta adresi', isPublic: true },
            { key: 'address', value: 'Bismil, Diyarbakır', category: 'contact', description: 'Adres bilgisi', isPublic: true },
            { key: 'working_hours', value: '7/24 Hizmet', category: 'contact', description: 'Çalışma saatleri', isPublic: true },
            { key: 'map_latitude', value: '37.842249', category: 'contact', description: 'Google Maps latitude koordinatı', isPublic: true },
            { key: 'map_longitude', value: '40.669449', category: 'contact', description: 'Google Maps longitude koordinatı', isPublic: true },
            // Footer settings
            { key: 'footer_company_name', value: 'Bismil Vinç', category: 'footer', description: 'Footer şirket adı', isPublic: true },
            { key: 'footer_description', value: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri. Güvenli, hızlı ve kaliteli çözümler.', category: 'footer', description: 'Footer şirket açıklaması', isPublic: true },
            { key: 'footer_phone', value: '0532 667 78 52', category: 'footer', description: 'Footer telefon numarası', isPublic: true },
            { key: 'footer_phone2', value: '0555 123 45 67', category: 'footer', description: 'Footer ikinci telefon numarası', isPublic: true },
            { key: 'footer_whatsapp', value: '0555 123 45 67', category: 'footer', description: 'Footer WhatsApp numarası', isPublic: true },
            { key: 'footer_email', value: 'info@bismilvinc.com', category: 'footer', description: 'Footer e-posta adresi', isPublic: true },
            { key: 'footer_address', value: 'Bismil, Diyarbakır', category: 'footer', description: 'Footer adres bilgisi', isPublic: true },
            { key: 'footer_working_hours', value: '7/24 Hizmet', category: 'footer', description: 'Footer çalışma saatleri', isPublic: true },
            { key: 'footer_home_link', value: 'Ana Sayfa', category: 'footer', description: 'Footer ana sayfa link metni', isPublic: true },
            { key: 'footer_services_link', value: 'Hizmetler', category: 'footer', description: 'Footer hizmetler link metni', isPublic: true },
            { key: 'footer_about_link', value: 'Hakkımızda', category: 'footer', description: 'Footer hakkımızda link metni', isPublic: true },
            { key: 'footer_contact_link', value: 'İletişim', category: 'footer', description: 'Footer iletişim link metni', isPublic: true },
            { key: 'footer_service1', value: 'Mobil Vinç Kiralama', category: 'footer', description: 'Footer hizmet 1', isPublic: true },
            { key: 'footer_service2', value: 'Platform Lift Kiralama', category: 'footer', description: 'Footer hizmet 2', isPublic: true },
            { key: 'footer_service3', value: 'İnşaat Kurulum Hizmetleri', category: 'footer', description: 'Footer hizmet 3', isPublic: true },
            { key: 'footer_service4', value: 'Petrol Kuyusu Hizmetleri', category: 'footer', description: 'Footer hizmet 4', isPublic: true },
            { key: 'footer_service5', value: 'Petrol ve İnşaat Sahası', category: 'footer', description: 'Footer hizmet 5', isPublic: true },
            { key: 'footer_copyright', value: '© 2024 Bismil Vinç. Tüm hakları saklıdır.', category: 'footer', description: 'Footer copyright metni', isPublic: true },

            // Navbar ayarları
            { key: 'navbar_company_name', value: 'Bismil Vinç', category: 'navbar', isPublic: true },
            { key: 'navbar_home_link', value: 'Ana Sayfa', category: 'navbar', isPublic: true },
            { key: 'navbar_services_link', value: 'Hizmetler', category: 'navbar', isPublic: true },
            { key: 'navbar_about_link', value: 'Hakkımızda', category: 'navbar', isPublic: true },
            { key: 'navbar_contact_link', value: 'İletişim', category: 'navbar', isPublic: true },

            // Footer ayarları
        ];
    }

    static getCategories() {
        return [
            { value: 'general', label: 'Genel' },
            { value: 'contact', label: 'İletişim' },
            { value: 'social', label: 'Sosyal Medya' },
            { value: 'seo', label: 'SEO' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'email', label: 'E-posta' },
            { value: 'cloudinary', label: 'Cloudinary' },
            { value: 'media', label: 'Medya' },
            { value: 'footer', label: 'Footer' },
            { value: 'navbar', label: 'Navbar' }
        ];
    }

    static getTypes() {
        return [
            { value: 'string', label: 'Metin' },
            { value: 'number', label: 'Sayı' },
            { value: 'boolean', label: 'Evet/Hayır' },
            { value: 'json', label: 'JSON' }
        ];
    }
}

module.exports = Settings; 