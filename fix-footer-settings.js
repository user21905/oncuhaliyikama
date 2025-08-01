const { MongoClient } = require('mongodb');
require('dotenv').config();

async function fixFooterSettings() {
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        await client.connect();
        console.log('MongoDB bağlantısı başarılı');
        
        const db = client.db();
        const settingsCollection = db.collection('settings');
        
        // Yeni footer ayarlarını ekle
        const newFooterSettings = [
            { key: 'footer_phone2', value: '0555 123 45 67', category: 'footer', description: 'Footer ikinci telefon numarası', isPublic: true },
            { key: 'footer_whatsapp', value: '0555 123 45 67', category: 'footer', description: 'Footer WhatsApp numarası', isPublic: true },
            { key: 'footer_email', value: 'info@bismilvinc.com', category: 'footer', description: 'Footer e-posta adresi', isPublic: true }
        ];
        
        for (const setting of newFooterSettings) {
            const existingSetting = await settingsCollection.findOne({ key: setting.key });
            if (!existingSetting) {
                await settingsCollection.insertOne({
                    ...setting,
                    type: 'string',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`✅ ${setting.key} eklendi`);
            } else {
                console.log(`ℹ️ ${setting.key} zaten mevcut`);
            }
        }
        
        console.log('Footer ayarları güncellendi!');
        
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await client.close();
    }
}

fixFooterSettings(); 