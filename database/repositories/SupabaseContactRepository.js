const supabaseConnection = require('../supabase-connection');

class SupabaseContactRepository {
    constructor() {
        this.tableName = 'contacts';
    }

    async connect() {
        return await supabaseConnection.connect();
    }

    async create(contactData) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([contactData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Contact oluşturma hatası:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Contact listesi alma hatası:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const supabase = await this.connect();
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
            const supabase = await this.connect();
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
            const supabase = await this.connect();
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
            const supabase = await this.connect();
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