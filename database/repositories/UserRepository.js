const databaseConnection = require('../connection');
const User = require('../models/User');
const { ObjectId } = require('mongodb');

class UserRepository {
    constructor() {
        this.collectionName = User.collectionName;
    }

    async getCollection() {
        if (!databaseConnection.isConnected) {
            throw new Error('MongoDB bağlantısı yok');
        }
        return databaseConnection.getDb().collection(this.collectionName);
    }

    async create(userData) {
        try {
            const collection = await this.getCollection();
            const user = new User(userData);
            
            // Şifreyi hash'le
            await user.hashPassword();
            
            const result = await collection.insertOne(user.toJSON());
            return { ...user.toJSON(), _id: result.insertedId };
        } catch (error) {
            console.error('Kullanıcı oluşturma hatası:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const collection = await this.getCollection();
            const user = await collection.findOne({ _id: new ObjectId(id) });
            
            if (!user) {
                return null;
            }

            return new User(user);
        } catch (error) {
            console.error('Kullanıcı getirme hatası:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const collection = await this.getCollection();
            const user = await collection.findOne({ email: email.toLowerCase() });
            
            if (!user) {
                return null;
            }

            return new User(user);
        } catch (error) {
            console.error('E-posta ile kullanıcı getirme hatası:', error);
            throw error;
        }
    }

    async findAll(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = { createdAt: -1 },
                filter = {}
            } = options;

            const collection = await this.getCollection();
            const skip = (page - 1) * limit;

            const users = await collection
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collection.countDocuments(filter);

            return {
                users: users.map(user => new User(user)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Kullanıcı listesi getirme hatası:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const collection = await this.getCollection();
            
            // Şifre güncelleniyorsa hash'le
            if (updateData.password) {
                const user = new User({ password: updateData.password });
                await user.hashPassword();
                updateData.password = user.password;
            }

            updateData.updatedAt = new Date();

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                throw new Error('Kullanıcı bulunamadı');
            }

            return await this.findById(id);
        } catch (error) {
            console.error('Kullanıcı güncelleme hatası:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const collection = await this.getCollection();
            
            const result = await collection.deleteOne({ 
                _id: new ObjectId(id) 
            });

            if (result.deletedCount === 0) {
                throw new Error('Kullanıcı bulunamadı');
            }

            return { success: true, message: 'Kullanıcı başarıyla silindi' };
        } catch (error) {
            console.error('Kullanıcı silme hatası:', error);
            throw error;
        }
    }

    async authenticate(email, password) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                return { success: false, message: 'Kullanıcı bulunamadı' };
            }

            if (!user.isActive) {
                return { success: false, message: 'Hesap aktif değil' };
            }

            if (user.isLocked()) {
                return { success: false, message: 'Hesap kilitli. Lütfen daha sonra tekrar deneyin.' };
            }

            const isPasswordValid = await user.comparePassword(password);
            
            if (!isPasswordValid) {
                await user.incrementLoginAttempts();
                await this.update(user._id.toString(), {
                    loginAttempts: user.loginAttempts,
                    lockUntil: user.lockUntil
                });
                
                return { success: false, message: 'Geçersiz şifre' };
            }

            // Başarılı giriş - login attempt'leri sıfırla
            await user.resetLoginAttempts();
            await this.update(user._id.toString(), {
                lastLogin: new Date(),
                loginAttempts: 0,
                lockUntil: null
            });

            return {
                success: true,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin
                }
            };
        } catch (error) {
            console.error('Kimlik doğrulama hatası:', error);
            throw error;
        }
    }

    async changePassword(id, currentPassword, newPassword) {
        try {
            const user = await this.findById(id);
            
            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            
            if (!isCurrentPasswordValid) {
                throw new Error('Mevcut şifre yanlış');
            }

            // Yeni şifreyi hash'le
            user.password = newPassword;
            await user.hashPassword();

            await this.update(id, { password: user.password });

            return { success: true, message: 'Şifre başarıyla değiştirildi' };
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                throw new Error('Kullanıcı bulunamadı');
            }

            // Şifre sıfırlama token'ı oluştur
            const resetToken = require('crypto').randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 3600000); // 1 saat

            await this.update(user._id.toString(), {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            });

            return {
                success: true,
                resetToken,
                resetExpires,
                message: 'Şifre sıfırlama bağlantısı oluşturuldu'
            };
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            throw error;
        }
    }

    async confirmPasswordReset(token, newPassword) {
        try {
            const collection = await this.getCollection();
            
            const user = await collection.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: new Date() }
            });

            if (!user) {
                throw new Error('Geçersiz veya süresi dolmuş token');
            }

            // Yeni şifreyi hash'le
            const userInstance = new User({ password: newPassword });
            await userInstance.hashPassword();

            await this.update(user._id.toString(), {
                password: userInstance.password,
                passwordResetToken: null,
                passwordResetExpires: null
            });

            return { success: true, message: 'Şifre başarıyla sıfırlandı' };
        } catch (error) {
            console.error('Şifre sıfırlama onaylama hatası:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const collection = await this.getCollection();
            
            const stats = await collection.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: ['$isActive', 1, 0] } },
                        inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
                        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                        managers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
                        users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
                    }
                }
            ]).toArray();

            return stats[0] || {
                total: 0,
                active: 0,
                inactive: 0,
                admins: 0,
                managers: 0,
                users: 0
            };
        } catch (error) {
            console.error('Kullanıcı istatistikleri hatası:', error);
            throw error;
        }
    }

    async initializeDefaultAdmin() {
        try {
            const collection = await this.getCollection();
            const defaultAdmin = User.getDefaultAdmin();
            
            // Admin zaten var mı kontrol et
            const existingAdmin = await collection.findOne({ email: defaultAdmin.email });
            
            if (!existingAdmin) {
                const admin = new User(defaultAdmin);
                await admin.hashPassword();
                
                await collection.insertOne(admin.toJSON());
                console.log('✅ Varsayılan admin kullanıcısı oluşturuldu');
            } else {
                console.log('ℹ️ Admin kullanıcısı zaten mevcut');
            }
        } catch (error) {
            console.error('Varsayılan admin oluşturma hatası:', error);
            throw error;
        }
    }

    async searchUsers(query, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = { createdAt: -1 }
            } = options;

            const collection = await this.getCollection();
            const skip = (page - 1) * limit;

            const filter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            };

            const users = await collection
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collection.countDocuments(filter);

            return {
                users: users.map(user => new User(user)),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Kullanıcı arama hatası:', error);
            throw error;
        }
    }
}

module.exports = UserRepository; 