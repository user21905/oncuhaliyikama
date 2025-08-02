const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary konfigürasyonu
console.log('=== CLOUDINARY KONFİGÜRASYONU ===');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'VAR' : 'YOK');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'VAR' : 'YOK');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'VAR' : 'YOK');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    constructor() {
        // Upload preset kullanmıyoruz, doğrudan API ile yükleme yapacağız
        console.log('CloudinaryService başlatıldı');
    }

    /**
     * Dosya yükleme
     * @param {Buffer|string} file - Yüklenecek dosya (buffer veya base64)
     * @param {Object} options - Yükleme seçenekleri
     * @returns {Promise<Object>} Yükleme sonucu
     */
    async uploadFile(file, options = {}) {
        try {
            console.log('=== CLOUDINARY UPLOAD BAŞLADI ===');
            console.log('File type:', typeof file);
            console.log('File length:', file.length);
            console.log('Options:', options);
            
            // Cloudinary credentials kontrolü
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                throw new Error('Cloudinary credentials eksik');
            }
            
            // Placeholder credentials kontrolü
            if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name' || 
                process.env.CLOUDINARY_API_KEY === 'your_api_key' || 
                process.env.CLOUDINARY_API_SECRET === 'your_api_secret') {
                throw new Error('Cloudinary credentials placeholder değerler');
            }
            
            const {
                folder = 'bismilvinc',
                public_id = null,
                transformation = [],
                resource_type = 'auto',
                allowed_formats = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
                max_bytes = 10485760 // 10MB
            } = options;

            // Dosya formatını kontrol et
            const fileFormat = this.getFileFormat(file);
            console.log('Detected file format:', fileFormat);
            
            if (!allowed_formats.includes(fileFormat.toLowerCase())) {
                throw new Error(`Desteklenmeyen dosya formatı: ${fileFormat}`);
            }

            // Dosya boyutunu kontrol et
            if (file.length > max_bytes) {
                throw new Error(`Dosya boyutu çok büyük. Maksimum: ${max_bytes / 1024 / 1024}MB`);
            }

            const uploadOptions = {
                folder,
                resource_type,
                transformation
            };

            if (public_id) {
                uploadOptions.public_id = public_id;
            }

            // Dosya türüne göre özel ayarlar
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileFormat.toLowerCase())) {
                uploadOptions.transformation = [
                    { quality: 'auto:good', fetch_format: 'auto' },
                    ...transformation
                ];
            }

            console.log('Upload options:', uploadOptions);
            console.log('Cloudinary upload başlıyor...');

            const result = await cloudinary.uploader.upload(file, uploadOptions);

            console.log('Cloudinary upload başarılı:', {
                public_id: result.public_id,
                url: result.secure_url,
                format: result.format,
                size: result.bytes
            });

            return {
                success: true,
                data: {
                    public_id: result.public_id,
                    url: result.secure_url,
                    format: result.format,
                    size: result.bytes,
                    width: result.width,
                    height: result.height,
                    created_at: result.created_at
                }
            };
        } catch (error) {
            console.error('=== CLOUDINARY UPLOAD HATASI ===');
            console.error('Cloudinary yükleme hatası:', error);
            console.error('Error stack:', error.stack);
            
            // Daha detaylı hata mesajları
            let errorMessage = error.message;
            if (error.message.includes('Invalid API key')) {
                errorMessage = 'Geçersiz Cloudinary API anahtarı';
            } else if (error.message.includes('Invalid signature')) {
                errorMessage = 'Geçersiz Cloudinary imzası';
            } else if (error.message.includes('Resource not found')) {
                errorMessage = 'Cloudinary kaynağı bulunamadı';
            } else if (error.message.includes('credentials')) {
                errorMessage = 'Cloudinary ayarları eksik veya hatalı';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Base64 dosya yükleme
     * @param {string} base64Data - Base64 formatında dosya
     * @param {Object} options - Yükleme seçenekleri
     * @returns {Promise<Object>} Yükleme sonucu
     */
    async uploadBase64(base64Data, options = {}) {
        try {
            console.log('=== CLOUDINARY BASE64 UPLOAD BAŞLADI ===');
            console.log('Base64 data length:', base64Data.length);
            
            // Base64 prefix'ini kontrol et ve düzenle
            let dataUrl = base64Data;
            if (!dataUrl.startsWith('data:')) {
                dataUrl = `data:image/jpeg;base64,${base64Data}`;
                console.log('Base64 prefix eklendi');
            }

            console.log('Data URL prefix:', dataUrl.substring(0, 50) + '...');
            
            return await this.uploadFile(dataUrl, options);
        } catch (error) {
            console.error('=== CLOUDINARY BASE64 UPLOAD HATASI ===');
            console.error('Base64 yükleme hatası:', error);
            console.error('Error stack:', error.stack);
            
            // Daha detaylı hata mesajları
            let errorMessage = error.message;
            if (error.message.includes('Invalid API key')) {
                errorMessage = 'Geçersiz Cloudinary API anahtarı';
            } else if (error.message.includes('Invalid signature')) {
                errorMessage = 'Geçersiz Cloudinary imzası';
            } else if (error.message.includes('Resource not found')) {
                errorMessage = 'Cloudinary kaynağı bulunamadı';
            } else if (error.message.includes('credentials')) {
                errorMessage = 'Cloudinary ayarları eksik veya hatalı';
            }
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Dosya silme
     * @param {string} publicId - Cloudinary public ID
     * @param {string} resourceType - Kaynak türü (image, video, raw)
     * @returns {Promise<Object>} Silme sonucu
     */
    async deleteFile(publicId, resourceType = 'image') {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType
            });

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Cloudinary silme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Dosya güncelleme
     * @param {string} publicId - Cloudinary public ID
     * @param {Buffer|string} newFile - Yeni dosya
     * @param {Object} options - Güncelleme seçenekleri
     * @returns {Promise<Object>} Güncelleme sonucu
     */
    async updateFile(publicId, newFile, options = {}) {
        try {
            // Önce eski dosyayı sil
            await this.deleteFile(publicId);

            // Yeni dosyayı yükle
            const uploadOptions = {
                ...options,
                public_id: publicId
            };

            return await this.uploadFile(newFile, uploadOptions);
        } catch (error) {
            console.error('Cloudinary güncelleme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Dosya bilgilerini getir
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<Object>} Dosya bilgileri
     */
    async getFileInfo(publicId) {
        try {
            const result = await cloudinary.api.resource(publicId);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Dosya bilgisi getirme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Klasördeki dosyaları listele
     * @param {string} folder - Klasör adı
     * @param {Object} options - Listeleme seçenekleri
     * @returns {Promise<Object>} Dosya listesi
     */
    async listFiles(folder = 'bismilvinc', options = {}) {
        try {
            const {
                max_results = 50,
                next_cursor = null,
                type = 'upload'
            } = options;

            const result = await cloudinary.api.resources({
                type,
                prefix: folder,
                max_results,
                next_cursor
            });

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Dosya listesi getirme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Dosya formatını belirle
     * @param {Buffer|string} file - Dosya
     * @returns {string} Dosya formatı
     */
    getFileFormat(file) {
        if (typeof file === 'string') {
            if (file.startsWith('data:')) {
                const match = file.match(/data:([^;]+);/);
                if (match) {
                    const mimeType = match[1];
                    return mimeType.split('/')[1];
                }
            }
            return 'unknown';
        }
        
        // Buffer için magic number kontrolü
        const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
        const header = buffer.toString('hex', 0, 4);
        
        const signatures = {
            '89504e47': 'png',
            '47494638': 'gif',
            'ffd8ffe0': 'jpg',
            'ffd8ffe1': 'jpg',
            '25504446': 'pdf',
            '504b0304': 'docx',
            'd0cf11e0': 'doc'
        };

        for (const [signature, format] of Object.entries(signatures)) {
            if (header.startsWith(signature)) {
                return format;
            }
        }

        return 'unknown';
    }

    /**
     * Resim optimizasyonu
     * @param {string} publicId - Cloudinary public ID
     * @param {Object} transformation - Dönüşüm seçenekleri
     * @returns {string} Optimize edilmiş URL
     */
    getOptimizedUrl(publicId, transformation = {}) {
        const defaultTransformation = {
            quality: 'auto:good',
            fetch_format: 'auto',
            ...transformation
        };

        return cloudinary.url(publicId, {
            transformation: defaultTransformation,
            secure: true
        });
    }

    /**
     * Thumbnail URL'i oluştur
     * @param {string} publicId - Cloudinary public ID
     * @param {number} width - Genişlik
     * @param {number} height - Yükseklik
     * @param {string} crop - Kırpma modu
     * @returns {string} Thumbnail URL
     */
    getThumbnailUrl(publicId, width = 300, height = 300, crop = 'fill') {
        return cloudinary.url(publicId, {
            transformation: {
                width,
                height,
                crop,
                quality: 'auto:good'
            },
            secure: true
        });
    }

    /**
     * Klasör oluştur
     * @param {string} folderName - Klasör adı
     * @returns {Promise<Object>} Oluşturma sonucu
     */
    async createFolder(folderName) {
        try {
            // Cloudinary'de klasör oluşturmak için boş bir dosya yükle
            const result = await this.uploadFile('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
                folder: folderName,
                public_id: '.keep'
            });

            return {
                success: true,
                data: { folder: folderName }
            };
        } catch (error) {
            console.error('Klasör oluşturma hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Klasör silme
     * @param {string} folderName - Klasör adı
     * @returns {Promise<Object>} Silme sonucu
     */
    async deleteFolder(folderName) {
        try {
            // Klasördeki tüm dosyaları listele
            const files = await this.listFiles(folderName);
            
            if (files.success && files.data.resources.length > 0) {
                // Tüm dosyaları sil
                for (const resource of files.data.resources) {
                    await this.deleteFile(resource.public_id, resource.resource_type);
                }
            }

            return {
                success: true,
                data: { folder: folderName, deleted: true }
            };
        } catch (error) {
            console.error('Klasör silme hatası:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new CloudinaryService(); 