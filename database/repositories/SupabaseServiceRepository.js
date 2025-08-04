const supabaseConnection = require('../supabase-connection');

class SupabaseServiceRepository {
    constructor() {
        this.tableName = 'services';
    }

    async connect() {
        return await supabaseConnection.connect();
    }

    async create(serviceData) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([serviceData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Service oluşturma hatası:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const supabase = await this.connect();
            console.log('🔍 Services findAll başlıyor...');
            
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('id', { ascending: false });

            if (error) {
                console.error('❌ Services findAll error:', error);
                throw error;
            }
            
            console.log(`✅ Services findAll başarılı: ${data ? data.length : 0} adet hizmet bulundu`);
            if (data && data.length > 0) {
                data.forEach((service, index) => {
                    console.log(`  ${index + 1}. ID: ${service.id}, Title: ${service.title}, Slug: ${service.slug}`);
                });
            }
            
            return data || [];
        } catch (error) {
            console.error('❌ Service listesi alma hatası:', error);
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
            console.error('Service bulma hatası:', error);
            throw error;
        }
    }

    async findBySlug(slug) {
        try {
            const supabase = await this.connect();
            console.log(`🔍 Service findBySlug: ${slug}`);
            
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (error) {
                console.error(`❌ Service findBySlug error (${slug}):`, error);
                throw error;
            }
            
            if (data) {
                console.log(`✅ Service findBySlug bulundu: ${data.title} (ID: ${data.id})`);
            } else {
                console.log(`⚠️ Service findBySlug bulunamadı: ${slug}`);
            }
            
            return data;
        } catch (error) {
            console.error(`❌ Service slug bulma hatası (${slug}):`, error);
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
            console.error('Service güncelleme hatası:', error);
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
            console.error('Service silme hatası:', error);
            throw error;
        }
    }

    async initializeDefaultServices() {
        try {
            const supabase = await this.connect();
            
            // Mevcut hizmetleri kontrol et
            const { data: existingServices, error: checkError } = await supabase
                .from(this.tableName)
                .select('*');

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            // Eğer hiç hizmet yoksa, default hizmetleri oluştur
            if (!existingServices || existingServices.length === 0) {
                const defaultServices = [
                    {
                        title: 'Mobil Vinç Hizmeti',
                        slug: 'mobil-vinc-hizmeti',
                        description: 'Profesyonel mobil vinç hizmetleri ile her türlü yükleme ve taşıma işlemlerinizi güvenle gerçekleştiriyoruz.',
                        content: 'Mobil vinç hizmetlerimiz ile inşaat sahalarında, depolarda ve her türlü mekanda yükleme ve taşıma işlemlerinizi gerçekleştiriyoruz. Deneyimli ekibimiz ve modern ekipmanlarımızla hızlı ve güvenli hizmet sunuyoruz.',
                        image: '/images/mobil-vinc.jpg',
                        is_active: true,
                        order: 1
                    },
                    {
                        title: 'Petrol İnşaat Sahası Hizmetleri',
                        slug: 'petrol-insaat-sahasi-hizmetleri',
                        description: 'Petrol inşaat sahalarında özel vinç hizmetleri ile kritik operasyonları destekliyoruz.',
                        content: 'Petrol inşaat sahalarında özel vinç hizmetlerimiz ile kritik operasyonları güvenle gerçekleştiriyoruz. Sahaya özel çözümler ve 7/24 hizmet anlayışımızla yanınızdayız.',
                        image: '/images/petrol-insaat.jpg',
                        is_active: true,
                        order: 2
                    },
                    {
                        title: 'Petrol Kuyu Hizmetleri',
                        slug: 'petrol-kuyu-hizmetleri',
                        description: 'Petrol kuyularında özel vinç hizmetleri ile güvenli ve verimli operasyonlar.',
                        content: 'Petrol kuyularında özel vinç hizmetlerimiz ile güvenli ve verimli operasyonlar gerçekleştiriyoruz. Uzman ekibimiz ve özel ekipmanlarımızla en zorlu koşullarda bile hizmet veriyoruz.',
                        image: '/images/petrol-kuyu.jpg',
                        is_active: true,
                        order: 3
                    },
                    {
                        title: 'İnşaat Kurulumu',
                        slug: 'insaat-kurulumu',
                        description: 'İnşaat projelerinde vinç kurulumu ve operasyon hizmetleri.',
                        content: 'İnşaat projelerinde vinç kurulumu ve operasyon hizmetlerimiz ile projelerinizi zamanında ve güvenle tamamlıyoruz. Profesyonel ekibimiz ve modern ekipmanlarımızla kaliteli hizmet sunuyoruz.',
                        image: '/images/insaat-kurulumu.jpg',
                        is_active: true,
                        order: 4
                    }
                ];

                const { error: insertError } = await supabase
                    .from(this.tableName)
                    .insert(defaultServices);

                if (insertError) throw insertError;
                console.log('✅ Default hizmetler oluşturuldu');
            } else {
                console.log('✅ Hizmetler zaten mevcut');
            }
        } catch (error) {
            console.error('Default hizmetler oluşturma hatası:', error);
            throw error;
        }
    }

    async getActiveServices() {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('is_active', true)
                .order('order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Aktif hizmetleri alma hatası:', error);
            return [];
        }
    }

    async updateOrder(id, order) {
        try {
            const supabase = await this.connect();
            const { error } = await supabase
                .from(this.tableName)
                .update({ order: order })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Hizmet sırası güncelleme hatası:', error);
            throw error;
        }
    }
}

module.exports = SupabaseServiceRepository; 