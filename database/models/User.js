const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this._id = data._id || new ObjectId();
        this.email = data.email;
        this.password = data.password;
        this.name = data.name;
        this.role = data.role || 'admin'; // admin, manager, user
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.lastLogin = data.lastLogin || null;
        this.loginAttempts = data.loginAttempts || 0;
        this.lockUntil = data.lockUntil || null;
        this.passwordResetToken = data.passwordResetToken || null;
        this.passwordResetExpires = data.passwordResetExpires || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    static get collectionName() {
        return 'users';
    }

    toJSON() {
        const obj = {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role,
            isActive: this.isActive,
            lastLogin: this.lastLogin,
            loginAttempts: this.loginAttempts,
            lockUntil: this.lockUntil,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        // Password'ü sadece gerekli durumlarda dahil et
        if (this.password) {
            obj.password = this.password;
        }

        return obj;
    }

    static validate(data) {
        const errors = [];

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Geçerli bir e-posta adresi giriniz');
        }

        if (!data.name || data.name.trim().length < 2) {
            errors.push('İsim en az 2 karakter olmalıdır');
        }

        if (data.password && data.password.length < 6) {
            errors.push('Şifre en az 6 karakter olmalıdır');
        }

        if (data.role && !['admin', 'manager', 'user'].includes(data.role)) {
            errors.push('Geçersiz rol');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 12);
        }
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    isLocked() {
        return !!(this.lockUntil && this.lockUntil > Date.now());
    }

    async incrementLoginAttempts() {
        this.loginAttempts += 1;
        
        // 5 başarısız denemeden sonra 2 saat kilitle
        if (this.loginAttempts >= 5 && !this.isLocked()) {
            this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 saat
        }
    }

    async resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockUntil = null;
    }

    static getRoles() {
        return [
            { value: 'admin', label: 'Yönetici' },
            { value: 'manager', label: 'Müdür' },
            { value: 'user', label: 'Kullanıcı' }
        ];
    }

    static getDefaultAdmin() {
        return {
            email: process.env.ADMIN_EMAIL || 'admin@bismilvinc.com',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            name: 'Admin',
            role: 'admin',
            isActive: true
        };
    }
}

module.exports = User; 