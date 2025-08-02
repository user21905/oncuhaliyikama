const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        this.connectionError = null;
    }

    /**
     * MongoDB URI'sini validate et
     */
    validateMongoUri(uri) {
        if (!uri) {
            throw new Error('MONGODB_URI environment variable eksik');
        }

        // Sadece eski placeholder değerleri kontrol et (yeni MongoDB Atlas'ta olmayan)
        const oldPlaceholderPatterns = [
            'your_username',
            'your_password', 
            'your_cluster',
            'your_mongodb_connection_string',
            'your_database_name'
        ];

        for (const pattern of oldPlaceholderPatterns) {
            if (uri.includes(pattern)) {
                throw new Error(`MONGODB_URI eski placeholder değer içeriyor: ${pattern}. Lütfen gerçek MongoDB bilgilerinizi girin.`);
            }
        }

        // URI formatını kontrol et
        if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
            throw new Error('MONGODB_URI geçersiz format. mongodb:// veya mongodb+srv:// ile başlamalı.');
        }

        // MongoDB Atlas formatını kontrol et (daha esnek)
        if (uri.startsWith('mongodb+srv://')) {
            // Atlas formatı kontrolü - daha esnek
            const hasUsername = uri.includes('@') && uri.split('@')[0].includes(':');
            const hasCluster = uri.includes('.mongodb.net');
            const hasDatabase = uri.includes('/') && !uri.split('/')[1].includes('?');
            
            if (!hasUsername || !hasCluster) {
                throw new Error('MongoDB Atlas URI formatı eksik. Kullanıcı adı, şifre ve cluster bilgisi gerekli.');
            }
        }

        return true;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('✅ MongoDB zaten bağlı');
                return this.db;
            }

            const uri = process.env.MONGODB_URI;
            
            // URI'yi validate et
            this.validateMongoUri(uri);
            
            console.log('🔗 MongoDB bağlantısı kuruluyor...');
            console.log('URI formatı:', uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'MongoDB Local');
            
            const options = {
                retryWrites: true,
                w: 'majority',
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 30000,
                heartbeatFrequencyMS: 10000,
                useUnifiedTopology: true,
                useNewUrlParser: true,
            };

            this.client = new MongoClient(uri, options);
            
            // Bağlantıyı test et
            await this.client.connect();
            
            // Database adını URI'den çıkar veya varsayılan kullan
            const dbName = this.extractDatabaseName(uri) || 'bismilvinc';
            this.db = this.client.db(dbName);
            
            // Bağlantıyı test et
            await this.db.admin().ping();
            
            this.isConnected = true;
            this.connectionError = null;
            
            console.log('✅ MongoDB bağlantısı başarılı');
            console.log(`📊 Database: ${dbName}`);
            return this.db;
            
        } catch (error) {
            this.connectionError = error;
            console.error('❌ MongoDB bağlantı hatası:', error.message);
            
            // Daha detaylı hata mesajları
            let userFriendlyError = 'MongoDB bağlantı hatası';
            
            if (error.message.includes('ENOTFOUND')) {
                userFriendlyError = 'MongoDB sunucusu bulunamadı. Cluster adını kontrol edin.';
            } else if (error.message.includes('Authentication failed')) {
                userFriendlyError = 'MongoDB kimlik doğrulama hatası. Kullanıcı adı ve şifreyi kontrol edin.';
            } else if (error.message.includes('ECONNREFUSED')) {
                userFriendlyError = 'MongoDB sunucusuna bağlanılamıyor. Sunucu çalışıyor mu?';
            } else if (error.message.includes('ETIMEDOUT')) {
                userFriendlyError = 'MongoDB bağlantı zaman aşımı. İnternet bağlantınızı kontrol edin.';
            } else if (error.message.includes('placeholder')) {
                userFriendlyError = error.message;
            }
            
            throw new Error(userFriendlyError);
        }
    }

    /**
     * URI'den database adını çıkar
     */
    extractDatabaseName(uri) {
        try {
            const url = new URL(uri);
            const pathname = url.pathname;
            if (pathname && pathname !== '/') {
                return pathname.substring(1); // Başındaki / işaretini kaldır
            }
        } catch (error) {
            // URL parse hatası - varsayılan database adını kullan
        }
        return 'bismilvinc';
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                this.isConnected = false;
                this.connectionError = null;
                console.log('🔌 MongoDB bağlantısı kapatıldı');
            }
        } catch (error) {
            console.error('❌ MongoDB bağlantısı kapatılırken hata:', error);
            throw error;
        }
    }

    getDb() {
        if (!this.isConnected) {
            throw new Error('MongoDB bağlantısı kurulmamış. Önce connect() metodunu çağırın.');
        }
        return this.db;
    }

    getCollection(collectionName) {
        const db = this.getDb();
        return db.collection(collectionName);
    }

    // Health check
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { 
                    status: 'disconnected', 
                    error: 'MongoDB bağlantısı yok',
                    timestamp: new Date() 
                };
            }
            
            const db = this.getDb();
            await db.admin().ping();
            return { 
                status: 'healthy', 
                timestamp: new Date() 
            };
        } catch (error) {
            return { 
                status: 'unhealthy', 
                error: error.message, 
                timestamp: new Date() 
            };
        }
    }

    // Bağlantı durumunu kontrol et
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            error: this.connectionError ? this.connectionError.message : null,
            timestamp: new Date()
        };
    }
}

// Singleton instance
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection; 