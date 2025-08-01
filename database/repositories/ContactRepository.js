const databaseConnection = require('../connection');
const Contact = require('../models/Contact');

class ContactRepository {
    constructor() {
        this.collectionName = Contact.collectionName;
    }

    async getCollection() {
        const db = await databaseConnection.connect();
        return db.collection(this.collectionName);
    }

    async create(contactData) {
        try {
            const collection = await this.getCollection();
            const contact = new Contact(contactData);
            
            const validation = Contact.validate(contactData);
            if (!validation.isValid) {
                throw new Error(`Validation error: ${validation.errors.join(', ')}`);
            }

            const result = await collection.insertOne(contact.toJSON());
            return { ...contact.toJSON(), _id: result.insertedId };
        } catch (error) {
            console.error('Contact oluşturma hatası:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            const contact = await collection.findOne({ _id: new ObjectId(id) });
            return contact;
        } catch (error) {
            console.error('Contact bulma hatası:', error);
            throw error;
        }
    }

    async findAll(options = {}) {
        try {
            const collection = await this.getCollection();
            const {
                page = 1,
                limit = 10,
                status,
                priority,
                service,
                search,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;

            // Filter oluştur
            const filter = {};
            
            if (status) filter.status = status;
            if (priority) filter.priority = priority;
            if (service) filter.service = service;
            
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } }
                ];
            }

            // Sort oluştur
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Pagination
            const skip = (page - 1) * limit;

            const [contacts, total] = await Promise.all([
                collection.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                collection.countDocuments(filter)
            ]);

            return {
                contacts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            console.error('Contact listesi getirme hatası:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            
            updateData.updatedAt = new Date();
            
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                throw new Error('Contact bulunamadı');
            }

            return await this.findById(id);
        } catch (error) {
            console.error('Contact güncelleme hatası:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const collection = await this.getCollection();
            const { ObjectId } = require('mongodb');
            
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 0) {
                throw new Error('Contact bulunamadı');
            }

            return { success: true, message: 'Contact başarıyla silindi' };
        } catch (error) {
            console.error('Contact silme hatası:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            const validStatuses = Contact.getStatusOptions().map(option => option.value);
            if (!validStatuses.includes(status)) {
                throw new Error('Geçersiz status değeri');
            }

            const updateData = { status, updatedAt: new Date() };
            
            if (status === 'replied') {
                updateData.repliedAt = new Date();
            }

            return await this.update(id, updateData);
        } catch (error) {
            console.error('Status güncelleme hatası:', error);
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
                        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
                        read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
                        replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
                        archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } }
                    }
                }
            ]).toArray();

            const serviceStats = await collection.aggregate([
                {
                    $group: {
                        _id: '$service',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayStats = await collection.countDocuments({
                createdAt: { $gte: today }
            });

            return {
                total: stats[0]?.total || 0,
                byStatus: {
                    new: stats[0]?.new || 0,
                    read: stats[0]?.read || 0,
                    replied: stats[0]?.replied || 0,
                    archived: stats[0]?.archived || 0
                },
                byService: serviceStats,
                today: todayStats
            };
        } catch (error) {
            console.error('İstatistik getirme hatası:', error);
            throw error;
        }
    }

    async getRecentContacts(limit = 5) {
        try {
            const collection = await this.getCollection();
            
            return await collection.find({})
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Son contactları getirme hatası:', error);
            throw error;
        }
    }
}

module.exports = ContactRepository; 