const supabaseConnection = require('../supabase-connection');

class SupabaseContactRepository {
    constructor() {
        this.tableName = 'contacts';
        if (!SupabaseContactRepository.memoryStore) {
            SupabaseContactRepository.memoryStore = [];
        }
    }

    async connect() {
        return await supabaseConnection.connect();
    }

    async getClient() {
        try {
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return supabaseConnection.getAdminClient();
            }
        } catch (e) {
            // admin client yoksa normal bağlan
        }
        return await this.connect();
    }

    async create(contactData) {
        try {
            const supabase = await this.getClient();
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([contactData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Contact oluşturma hatası:', error);
            // Memory fallback
            const record = {
                id: 'mem_' + Date.now(),
                created_at: new Date().toISOString(),
                is_read: false,
                status: 'new',
                source: 'website',
                priority: 'normal',
                ...contactData
            };
            SupabaseContactRepository.memoryStore.unshift(record);
            return record;
        }
    }

    async findAll() {
        try {
            const supabase = await this.getClient();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const dbData = Array.isArray(data) ? data : [];
            const memData = Array.isArray(SupabaseContactRepository.memoryStore) ? SupabaseContactRepository.memoryStore : [];
            // Supabase boş dönerse memory fallback'i de dön
            if (dbData.length === 0 && memData.length > 0) {
                return memData.slice();
            }
            return dbData;
        } catch (error) {
            console.error('Contact listesi alma hatası:', error);
            // Memory fallback
            return SupabaseContactRepository.memoryStore.slice();
        }
    }

    async findById(id) {
        try {
            const supabase = await this.getClient();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Contact bulma hatası:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const supabase = await this.getClient();
            const { data, error } = await supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Contact güncelleme hatası:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const supabase = await this.getClient();
            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Contact silme hatası:', error);
            throw error;
        }
    }

    async getUnreadCount() {
        try {
            const supabase = await this.getClient();
            const { count, error } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .eq('is_read', false);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Okunmamış mesaj sayısı alma hatası:', error);
            return 0;
        }
    }

    async markAsRead(id) {
        try {
            const supabase = await this.connect();
            const { error } = await supabase
                .from(this.tableName)
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Mesaj okundu işaretleme hatası:', error);
            throw error;
        }
    }
}

module.exports = SupabaseContactRepository; 