const databaseConnection = require('../connection');
const Settings = require('../models/Settings');

class SettingsRepository {
    constructor() {
        this.collectionName = Settings.collectionName;
    }

    async getCollection() {
        const db = await databaseConnection.connect();
        return db.collection(this.collectionName);
    }

    async initializeSettings() {
        try {
            const collection = await this.getCollection();
            const defaultSettings = Settings.getDefaultSettings();
            
            for (const setting of defaultSettings) {
                const existingSetting = await collection.findOne({ key: setting.key });
                if (!existingSetting) {
                    const newSetting = new Settings(setting);
                    await collection.insertOne(newSetting.toJSON());
                }
            }
            
            console.log('✅ Varsayılan ayarlar başarıyla yüklendi');
        } catch (error) {
            console.error('❌ Ayarlar yüklenirken hata:', error);
            throw error;
        }
    }

    async getByKey(key) {
        try {
            const collection = await this.getCollection();
            const setting = await collection.findOne({ key });
            
            if (!setting) {
                return null;
            }

            // Value'yu type'a göre parse et
            return this.parseValue(setting);
        } catch (error) {
            console.error('Ayar getirme hatası:', error);
            throw error;
        }
    }

    async getByCategory(category) {
        try {
            const collection = await this.getCollection();
            const settings = await collection.find({ category }).toArray();
            
            return settings.map(setting => this.parseValue(setting));
        } catch (error) {
            console.error('Kategori ayarları getirme hatası:', error);
            throw error;
        }
    }

    async getAll() {
        try {
            const collection = await this.getCollection();
            const settings = await collection.find({}).toArray();
            
            return settings.map(setting => this.parseValue(setting));
        } catch (error) {
            console.error('Tüm ayarları getirme hatası:', error);
            throw error;
        }
    }

    async getPublicSettings() {
        try {
            const collection = await this.getCollection();
            const settings = await collection.find({ isPublic: true }).toArray();
            
            return settings.map(setting => this.parseValue(setting));
        } catch (error) {
            console.error('Public ayarları getirme hatası:', error);
            throw error;
        }
    }

    async updateByKey(key, value) {
        try {
            const collection = await this.getCollection();
            
            const result = await collection.updateOne(
                { key },
                { 
                    $set: { 
                        value: value.toString(),
                        updatedAt: new Date()
                    }
                }
            );

            if (result.matchedCount === 0) {
                throw new Error(`Ayar bulunamadı: ${key}`);
            }

            return await this.getByKey(key);
        } catch (error) {
            console.error('Ayar güncelleme hatası:', error);
            throw error;
        }
    }

    async updateMultiple(updates) {
        try {
            const collection = await this.getCollection();
            const bulkOps = [];

            for (const [key, value] of Object.entries(updates)) {
                bulkOps.push({
                    updateOne: {
                        filter: { key },
                        update: {
                            $set: {
                                value: value.toString(),
                                updatedAt: new Date()
                            }
                        }
                    }
                });
            }

            if (bulkOps.length > 0) {
                const result = await collection.bulkWrite(bulkOps);
                console.log(`${result.modifiedCount} ayar güncellendi`);
            }

            return true;
        } catch (error) {
            console.error('Toplu ayar güncelleme hatası:', error);
            throw error;
        }
    }

    async create(settingData) {
        try {
            const collection = await this.getCollection();
            const setting = new Settings(settingData);
            
            const result = await collection.insertOne(setting.toJSON());
            return { ...setting.toJSON(), _id: result.insertedId };
        } catch (error) {
            console.error('Ayar oluşturma hatası:', error);
            throw error;
        }
    }

    async deleteByKey(key) {
        try {
            const collection = await this.getCollection();
            
            const result = await collection.deleteOne({ key });
            
            if (result.deletedCount === 0) {
                throw new Error(`Ayar bulunamadı: ${key}`);
            }

            return { success: true, message: 'Ayar başarıyla silindi' };
        } catch (error) {
            console.error('Ayar silme hatası:', error);
            throw error;
        }
    }

    async getSettingsAsObject() {
        try {
            const settings = await this.getAll();
            const settingsObj = {};
            
            for (const setting of settings) {
                settingsObj[setting.key] = setting.value;
            }
            
            return settingsObj;
        } catch (error) {
            console.error('Ayarları obje olarak getirme hatası:', error);
            throw error;
        }
    }

    async getPublicSettingsAsObject() {
        try {
            const settings = await this.getPublicSettings();
            const settingsObj = {};
            
            for (const setting of settings) {
                settingsObj[setting.key] = setting.value;
            }
            
            return settingsObj;
        } catch (error) {
            console.error('Public ayarları obje olarak getirme hatası:', error);
            throw error;
        }
    }

    parseValue(setting) {
        const parsed = { ...setting };
        
        switch (setting.type) {
            case 'number':
                parsed.value = parseFloat(setting.value) || 0;
                break;
            case 'boolean':
                parsed.value = setting.value === 'true';
                break;
            case 'json':
                try {
                    parsed.value = JSON.parse(setting.value);
                } catch (e) {
                    parsed.value = setting.value;
                }
                break;
            default:
                parsed.value = setting.value;
        }
        
        return parsed;
    }

    async resetToDefaults() {
        try {
            const collection = await this.getCollection();
            
            // Tüm ayarları sil
            await collection.deleteMany({});
            
            // Varsayılan ayarları yükle
            await this.initializeSettings();
            
            console.log('✅ Ayarlar varsayılan değerlere sıfırlandı');
            return true;
        } catch (error) {
            console.error('Ayarları sıfırlama hatası:', error);
            throw error;
        }
    }

    async exportSettings() {
        try {
            const settings = await this.getAll();
            return {
                exportDate: new Date(),
                settings: settings
            };
        } catch (error) {
            console.error('Ayar dışa aktarma hatası:', error);
            throw error;
        }
    }

    async importSettings(settingsData) {
        try {
            const collection = await this.getCollection();
            
            for (const setting of settingsData) {
                const existingSetting = await collection.findOne({ key: setting.key });
                
                if (existingSetting) {
                    await collection.updateOne(
                        { key: setting.key },
                        { $set: { value: setting.value, updatedAt: new Date() } }
                    );
                } else {
                    const newSetting = new Settings(setting);
                    await collection.insertOne(newSetting.toJSON());
                }
            }
            
            console.log('✅ Ayarlar başarıyla içe aktarıldı');
            return true;
        } catch (error) {
            console.error('Ayar içe aktarma hatası:', error);
            throw error;
        }
    }
}

module.exports = SettingsRepository; 