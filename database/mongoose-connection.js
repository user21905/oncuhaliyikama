const mongoose = require('mongoose');
require('dotenv').config();

class MongooseConnection {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected) {
                return;
            }

            const uri = process.env.MONGODB_URI;
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
                bufferMaxEntries: 0
            };

            await mongoose.connect(uri, options);
            this.isConnected = true;
            
            console.log('✅ Mongoose bağlantısı başarılı');
        } catch (error) {
            console.error('❌ Mongoose bağlantı hatası:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await mongoose.disconnect();
                this.isConnected = false;
                console.log('🔌 Mongoose bağlantısı kapatıldı');
            }
        } catch (error) {
            console.error('❌ Mongoose bağlantısı kapatılırken hata:', error);
            throw error;
        }
    }

    isConnected() {
        return this.isConnected;
    }
}

// Singleton instance
const mongooseConnection = new MongooseConnection();

module.exports = mongooseConnection; 