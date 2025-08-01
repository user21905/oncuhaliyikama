const multer = require('multer');
const cloudinaryService = require('../services/cloudinary');
const SettingsRepository = require('../database/repositories/SettingsRepository');

// Multer konfigürasyonu - geçici dosya yükleme
const storage = multer.memoryStorage();

const fileFilter = async (req, file, cb) => {
    try {
        const settingsRepo = new SettingsRepository();
        const allowedFormats = await settingsRepo.getByKey('cloudinary_allowed_formats');
        const maxFileSize = await settingsRepo.getByKey('cloudinary_max_file_size');
        
        const formats = allowedFormats ? allowedFormats.value : ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
        const maxSize = maxFileSize ? maxFileSize.value : 10485760; // 10MB default

        // Dosya formatını kontrol et
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        if (!formats.includes(fileExtension)) {
            return cb(new Error(`Desteklenmeyen dosya formatı: ${fileExtension}`), false);
        }

        // Dosya boyutunu kontrol et
        if (file.size > maxSize) {
            return cb(new Error(`Dosya boyutu çok büyük. Maksimum: ${maxSize / 1024 / 1024}MB`), false);
        }

        cb(null, true);
    } catch (error) {
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5 // Maksimum 5 dosya
    }
});

// Tek dosya yükleme middleware'i
const uploadSingle = (fieldName = 'file') => {
    return upload.single(fieldName);
};

// Çoklu dosya yükleme middleware'i
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
    return upload.array(fieldName, maxCount);
};

// Cloudinary'ye yükleme işlemi
const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file && !req.files) {
            return res.status(400).json({
                success: false,
                message: 'Yüklenecek dosya bulunamadı'
            });
        }

        const settingsRepo = new SettingsRepository();
        const folder = await settingsRepo.getByKey('cloudinary_folder');
        const folderName = folder ? folder.value : 'bismilvinc';

        if (req.file) {
            // Tek dosya yükleme
            const result = await cloudinaryService.uploadFile(req.file.buffer, {
                folder: folderName,
                public_id: `${folderName}/${Date.now()}_${req.file.originalname.split('.')[0]}`
            });

            if (result.success) {
                req.uploadedFile = result.data;
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }
        } else if (req.files) {
            // Çoklu dosya yükleme
            const uploadedFiles = [];
            
            for (const file of req.files) {
                const result = await cloudinaryService.uploadFile(file.buffer, {
                    folder: folderName,
                    public_id: `${folderName}/${Date.now()}_${file.originalname.split('.')[0]}`
                });

                if (result.success) {
                    uploadedFiles.push({
                        originalName: file.originalname,
                        ...result.data
                    });
                }
            }

            req.uploadedFiles = uploadedFiles;
        }

        next();
    } catch (error) {
        console.error('Cloudinary yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya yükleme hatası',
            error: error.message
        });
    }
};

// Base64 dosya yükleme middleware'i
const uploadBase64 = async (req, res, next) => {
    try {
        const { base64Data, fileName, folder = 'bismilvinc' } = req.body;

        if (!base64Data) {
            return res.status(400).json({
                success: false,
                message: 'Base64 verisi bulunamadı'
            });
        }

        const settingsRepo = new SettingsRepository();
        const defaultFolder = await settingsRepo.getByKey('cloudinary_folder');
        const uploadFolder = folder || (defaultFolder ? defaultFolder.value : 'bismilvinc');

        const result = await cloudinaryService.uploadBase64(base64Data, {
            folder: uploadFolder,
            public_id: fileName ? `${uploadFolder}/${Date.now()}_${fileName}` : undefined
        });

        if (result.success) {
            req.uploadedFile = result.data;
        } else {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        next();
    } catch (error) {
        console.error('Base64 yükleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Base64 dosya yükleme hatası',
            error: error.message
        });
    }
};

// Dosya silme middleware'i
const deleteFromCloudinary = async (req, res, next) => {
    try {
        const { publicId, resourceType = 'image' } = req.body;

        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Public ID bulunamadı'
            });
        }

        const result = await cloudinaryService.deleteFile(publicId, resourceType);

        if (result.success) {
            req.deletedFile = result.data;
        } else {
            return res.status(400).json({
                success: false,
                message: result.error
            });
        }

        next();
    } catch (error) {
        console.error('Cloudinary silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya silme hatası',
            error: error.message
        });
    }
};

// Hata yakalama middleware'i
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Dosya boyutu çok büyük'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Çok fazla dosya yüklendi'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Beklenmeyen dosya alanı'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: 'Dosya yükleme hatası',
        error: error.message
    });
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadToCloudinary,
    uploadBase64,
    deleteFromCloudinary,
    handleUploadError
}; 