const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class SupabaseConnection {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionError = null;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('✅ Supabase zaten bağlı');
                return this.client;
            }

            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error('SUPABASE_URL ve SUPABASE_ANON_KEY environment variables eksik');
            }

            console.log('🔗 Supabase bağlantısı kuruluyor...');
            
            // Admin işlemleri için service role key kullan, yoksa anon key kullan
            const keyToUse = serviceRoleKey || supabaseKey;
            console.log('🔑 Kullanılan key türü:', serviceRoleKey ? 'Service Role Key' : 'Anon Key');
            
            this.client = createClient(supabaseUrl, keyToUse);
            
            // Bağlantıyı test et
            const { data, error } = await this.client.from('settings').select('*').limit(1);
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
                throw new Error(`Supabase bağlantı hatası: ${error.message}`);
            }

            this.isConnected = true;
            this.connectionError = null;
            
            console.log('✅ Supabase bağlantısı başarılı');
            return this.client;
            
        } catch (error) {
            this.connectionError = error;
            console.error('❌ Supabase bağlantı hatası:', error.message);
            throw new Error(`Supabase bağlantı hatası: ${error.message}`);
        }
    }

    getClient() {
        if (!this.isConnected) {
            throw new Error('Supabase bağlantısı kurulmamış. Önce connect() metodunu çağırın.');
        }
        return this.client;
    }

    getAdminClient() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment variables eksik');
        }
        
        console.log('🔑 Admin client oluşturuluyor (Service Role Key ile)');
        return createClient(supabaseUrl, serviceRoleKey);
    }

    async disconnect() {
        try {
            if (this.client) {
                this.client = null;
                this.isConnected = false;
                this.connectionError = null;
                console.log('🔌 Supabase bağlantısı kapatıldı');
            }
        } catch (error) {
            console.error('❌ Supabase bağlantısı kapatılırken hata:', error);
            throw error;
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { 
                    status: 'disconnected', 
                    error: 'Supabase bağlantısı yok',
                    timestamp: new Date() 
                };
            }
            
            const { data, error } = await this.client.from('settings').select('count').limit(1);
            
            if (error) {
                return { 
                    status: 'unhealthy', 
                    error: error.message, 
                    timestamp: new Date() 
                };
            }
            
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

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            error: this.connectionError ? this.connectionError.message : null,
            timestamp: new Date()
        };
    }
}

// Singleton instance
const supabaseConnection = new SupabaseConnection();

module.exports = supabaseConnection; 