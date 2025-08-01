const databaseConnection = require('../connection');

class ServiceRepository {
    constructor() {
        this.collectionName = 'services';
    }

    async getCollection() {
        const db = databaseConnection.getDb();
        return db.collection(this.collectionName);
    }

    async create(serviceData) {
        try {
            const collection = await this.getCollection();
            const service = {
                ...serviceData,
                isActive: true,
                order: serviceData.order || 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            // Slug oluşturma
            if (!service.slug) {
                service.slug = service.name
                    .toLowerCase()
                    .replace(/ğ/g, 'g')
                    .replace(/ü/g, 'u')
                    .replace(/ş/g, 's')
                    .replace(/ı/g, 'i')
                    .replace(/ö/g, 'o')
                    .replace(/ç/g, 'c')
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
            
            const result = await collection.insertOne(service);
            return { _id: result.insertedId, ...service };
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            return await collection.findOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw error;
        }
    }

    async findBySlug(slug) {
        try {
            const collection = await this.getCollection();
            return await collection.findOne({ slug });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const collection = await this.getCollection();
            return await collection.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).toArray();
        } catch (error) {
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            const updateDoc = {
                ...updateData,
                updatedAt: new Date()
            };
            
            const result = await collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateDoc },
                { returnDocument: 'after' }
            );
            
            return result.value;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            return await collection.deleteOne({ _id: new ObjectId(id) });
        } catch (error) {
            throw error;
        }
    }

    async getStats() {
        try {
            const collection = await this.getCollection();
            const total = await collection.countDocuments();
            const active = await collection.countDocuments({ isActive: true });
            return { total, active };
        } catch (error) {
            throw error;
        }
    }

    async initializeDefaultServices() {
        try {
            const collection = await this.getCollection();
            const existingServices = await collection.countDocuments();
            
            if (existingServices > 0) {
                console.log('ℹ️ Hizmetler zaten mevcut');
                return;
            }

            const defaultServices = [
                {
                    name: 'Mobil Vinç Kiralama',
                    description: 'Yüksek kapasiteli mobil vinçlerimizle ağır yük taşıma ve kaldırma işlemleri. Diyarbakır ve çevre illerde profesyonel mobil vinç kiralama hizmeti.',
                    slug: 'mobilvinchizmeti',
                    icon: 'fas fa-truck',
                    order: 1,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Platform Lift Kiralama',
                    description: 'Yüksek erişim platform lift kiralama hizmeti. İnşaat, bakım ve montaj işleriniz için güvenli platform lift çözümleri.',
                    slug: 'platformlifthizmeti',
                    icon: 'fas fa-arrow-up',
                    order: 2,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'İnşaat Kurulum Hizmetleri',
                    description: 'İnşaat sahalarında kurulum, montaj ve taşıma işlemleri. Profesyonel ekipman ve uzman ekiple kaliteli hizmet.',
                    slug: 'insaatkurulumu',
                    icon: 'fas fa-building',
                    order: 3,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Petrol Kuyusu Hizmetleri',
                    description: 'Petrol ve doğalgaz sektöründe özel vinç ve kaldırma hizmetleri. Sahada güvenli ve hızlı çözümler.',
                    slug: 'petrolkuyuhizmeti',
                    icon: 'fas fa-oil-can',
                    order: 4,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: 'Petrol ve İnşaat Sahası Kurulum ve Taşıma',
                    description: 'Petrol sahalarında kurulum, taşıma ve montaj hizmetleri. Endüstriyel projeler için özel çözümler.',
                    slug: 'petrolinsaatsahasi',
                    icon: 'fas fa-industry',
                    order: 5,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];

            await collection.insertMany(defaultServices);
            console.log('✅ Varsayılan hizmetler oluşturuldu');
        } catch (error) {
            console.error('❌ Varsayılan hizmetler oluşturulurken hata:', error);
            throw error;
        }
    }
}

module.exports = ServiceRepository; 