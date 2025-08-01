const { ObjectId } = require('mongodb');

class Contact {
    constructor(data) {
        this._id = data._id || new ObjectId();
        this.name = data.name;
        this.phone = data.phone;
        this.email = data.email || null;
        this.service = data.service;
        this.message = data.message || '';
        this.status = data.status || 'new'; // new, read, replied, archived
        this.source = data.source || 'website'; // website, phone, whatsapp
        this.ipAddress = data.ipAddress || null;
        this.userAgent = data.userAgent || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.repliedAt = data.repliedAt || null;
        this.notes = data.notes || '';
        this.priority = data.priority || 'normal'; // low, normal, high, urgent
    }

    static get collectionName() {
        return process.env.MONGODB_COLLECTION_CONTACTS || 'contacts';
    }

    toJSON() {
        return {
            _id: this._id,
            name: this.name,
            phone: this.phone,
            email: this.email,
            service: this.service,
            message: this.message,
            status: this.status,
            source: this.source,
            ipAddress: this.ipAddress,
            userAgent: this.userAgent,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            repliedAt: this.repliedAt,
            notes: this.notes,
            priority: this.priority
        };
    }

    static validate(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('İsim en az 2 karakter olmalıdır');
        }

        if (!data.phone || !/^(\+90|0)?[5][0-9]{9}$/.test(data.phone.replace(/\s/g, ''))) {
            errors.push('Geçerli bir telefon numarası giriniz');
        }

        if (!data.service) {
            errors.push('Hizmet seçimi zorunludur');
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Geçerli bir e-posta adresi giriniz');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static getStatusOptions() {
        return [
            { value: 'new', label: 'Yeni' },
            { value: 'read', label: 'Okundu' },
            { value: 'replied', label: 'Yanıtlandı' },
            { value: 'archived', label: 'Arşivlendi' }
        ];
    }

    static getPriorityOptions() {
        return [
            { value: 'low', label: 'Düşük' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'Yüksek' },
            { value: 'urgent', label: 'Acil' }
        ];
    }

    static getServiceOptions() {
        return [
            { value: 'mobile-crane', label: 'Mobil Vinç Kiralama' },
            { value: 'platform-lift', label: 'Platform Lift Kiralama' },
            { value: 'construction', label: 'İnşaat Kurulum Hizmetleri' }
        ];
    }
}

module.exports = Contact; 