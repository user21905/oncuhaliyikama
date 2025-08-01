const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected) {
                return this.db;
            }

            const uri = process.env.MONGODB_URI;
            const options = {
                retryWrites: process.env.MONGODB_OPTIONS_RETRY_WRITES === 'true',
                w: process.env.MONGODB_OPTIONS_W || 'majority',
                maxPoolSize: parseInt(process.env.MONGODB_OPTIONS_MAX_POOL_SIZE) || 10,
                serverSelectionTimeoutMS: parseInt(process.env.MONGODB_OPTIONS_SERVER_SELECTION_TIMEOUT_MS) || 5000,
                socketTimeoutMS: parseInt(process.env.MONGODB_OPTIONS_SOCKET_TIMEOUT_MS) || 45000,
            };

            this.client = new MongoClient(uri, options);
            await this.client.connect();
            
            this.db = this.client.db(process.env.MONGODB_DB_NAME);
            this.isConnected = true;
            
            console.log('✅ MongoDB bağlantısı başarılı');
            return this.db;
        } catch (error) {
            console.error('❌ MongoDB bağlantı hatası:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                this.isConnected = false;
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
            const db = this.getDb();
            await db.admin().ping();
            return { status: 'healthy', timestamp: new Date() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message, timestamp: new Date() };
        }
    }
}

// Singleton instance
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection; 