const supabaseConnection = require('../supabase-connection');

class SupabaseSettingsRepository {
    constructor() {
        this.tableName = 'settings';
    }

    async connect() {
        return await supabaseConnection.connect();
    }

    async create(settingsData) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([settingsData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Settings oluşturma hatası:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Settings listesi alma hatası:', error);
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
            console.error('Settings bulma hatası:', error);
            throw error;
        }
    }

    async findByKey(key) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('key', key)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Settings key bulma hatası:', error);
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
            console.error('Settings güncelleme hatası:', error);
            throw error;
        }
    }

    async updateByKey(key, value) {
        try {
            const supabase = await this.connect();
            console.log(`🔧 Settings güncelleme: key=${key}, value=${value}`);
            
            // Admin işlemleri için admin client kullan
            let client = supabase;
            try {
                const adminClient = supabaseConnection.getAdminClient();
                console.log('🔑 Admin client kullanılıyor');
                client = adminClient;
            } catch (adminError) {
                console.log('⚠️ Admin client kullanılamıyor, normal client kullanılıyor:', adminError.message);
            }
            
            const { data, error, count } = await client
                .from(this.tableName)
                .update({ value: value })
                .eq('key', key)
                .select();

            if (error) {
                console.error('❌ Settings updateByKey error:', error);
                throw error;
            }
            
            // Etkilenen satır sayısını kontrol et
            if (!data || data.length === 0) {
                console.error(`❌ Settings güncelleme başarısız: key="${key}" bulunamadı`);
                throw new Error(`Settings key "${key}" bulunamadı`);
            }
            
            console.log(`✅ Settings güncelleme başarılı: key=${key}, etkilenen satır=${data.length}`);
            return data[0];
        } catch (error) {
            console.error('❌ Settings key güncelleme hatası:', error);
            throw error;
        }
    }

    async updateMultiple(updates) {
        try {
            const supabase = await this.connect();
            console.log(`🔧 Multiple settings güncelleme başlıyor: ${updates.length} adet`);
            
            // Admin işlemleri için admin client kullan
            let client = supabase;
            try {
                const adminClient = supabaseConnection.getAdminClient();
                console.log('🔑 Admin client kullanılıyor (multiple update)');
                client = adminClient;
            } catch (adminError) {
                console.log('⚠️ Admin client kullanılamıyor, normal client kullanılıyor:', adminError.message);
            }
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const update of updates) {
                try {
                    const { data, error } = await client
                        .from(this.tableName)
                        .update({ value: update.value })
                        .eq('key', update.key)
                        .select();
                    
                    if (error) {
                        console.error(`❌ Settings güncelleme hatası (${update.key}):`, error);
                        errorCount++;
                        errors.push({ key: update.key, error: error.message });
                    } else if (!data || data.length === 0) {
                        console.error(`❌ Settings güncelleme başarısız (${update.key}): key bulunamadı`);
                        errorCount++;
                        errors.push({ key: update.key, error: 'Key bulunamadı' });
                    } else {
                        console.log(`✅ Settings güncelleme başarılı: ${update.key}`);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`❌ Settings güncelleme exception (${update.key}):`, err);
                    errorCount++;
                    errors.push({ key: update.key, error: err.message });
                }
            }
            
            console.log(`📊 Multiple settings güncelleme sonucu: ${successCount} başarılı, ${errorCount} hatalı`);
            
            if (errorCount > 0) {
                throw new Error(`${errorCount} adet ayar güncellenemedi: ${JSON.stringify(errors)}`);
            }
            
            return { successCount, errorCount };
        } catch (error) {
            console.error('❌ Multiple settings güncelleme hatası:', error);
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
            console.error('Settings silme hatası:', error);
            throw error;
        }
    }

    async initializeDefaultSettings() {
        try {
            const supabase = await this.connect();
            
            // Default ayarları kontrol et
            const { data: existingSettings, error: checkError } = await supabase
                .from(this.tableName)
                .select('*');

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            // Eğer hiç ayar yoksa, default ayarları oluştur
            if (!existingSettings || existingSettings.length === 0) {
                const defaultSettings = [
                    {
                        key: 'site_title',
                        value: 'Bismil Vinç - Profesyonel Vinç Hizmetleri',
                        description: 'Site başlığı'
                    },
                    {
                        key: 'site_description',
                        value: 'Bismil ve çevresinde profesyonel vinç hizmetleri. Güvenilir, hızlı ve kaliteli çözümler.',
                        description: 'Site açıklaması'
                    },
                    {
                        key: 'contact_phone',
                        value: '+90 555 123 45 67',
                        description: 'İletişim telefonu'
                    },
                    {
                        key: 'contact_email',
                        value: 'info@bismilvinc.com',
                        description: 'İletişim e-posta'
                    },
                    {
                        key: 'contact_address',
                        value: 'Bismil, Diyarbakır, Türkiye',
                        description: 'İletişim adresi'
                    },
                    {
                        key: 'footer_text',
                        value: '© 2024 Bismil Vinç. Tüm hakları saklıdır.',
                        description: 'Footer metni'
                    }
                ];

                const { error: insertError } = await supabase
                    .from(this.tableName)
                    .insert(defaultSettings);

                if (insertError) throw insertError;
                console.log('✅ Default ayarlar oluşturuldu');
            } else {
                console.log('✅ Ayarlar zaten mevcut');
            }
        } catch (error) {
            console.error('Default ayarlar oluşturma hatası:', error);
            throw error;
        }
    }

    async getSettings() {
        try {
            const settings = await this.findAll();
            const settingsObject = {};
            
            settings.forEach(setting => {
                settingsObject[setting.key] = setting.value;
            });
            
            return settingsObject;
        } catch (error) {
            console.error('Ayarları alma hatası:', error);
            return {};
        }
    }

    async getPublicSettingsAsObject() {
        try {
            const settings = await this.findAll();
            const publicSettings = {
                // Navbar ayarları
                navbar_logo: '',
                navbar_company_name: 'Bismil Vinç',
                navbar_home_link: 'Ana Sayfa',
                navbar_services_link: 'Hizmetler',
                navbar_about_link: 'Hakkımızda',
                navbar_contact_link: 'İletişim',
                
                // Footer ayarları
                footer_company_name: 'Bismil Vinç',
                footer_description: 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri',
                footer_phone: '0555 123 45 67',
                footer_whatsapp: '0555 123 45 67',
                footer_email: 'info@bismilvinc.com',
                footer_address: 'Bismil, Diyarbakır',
                footer_working_hours: '7/24 Hizmet',
                
                // Hizmet resimleri
                service_mobilvinchizmeti_img: '',
                service_insaatkurulumu_img: '',
                service_petrolkuyuhizmeti_img: '',
                service_petrolinsaatsahasi_img: '',
                
                // Anasayfa hero arka planı
                homepage_hero_bg: '',
                
                // İletişim bilgileri
                contact_phone: '0555 123 45 67',
                contact_whatsapp: '0555 123 45 67',
                contact_email: 'info@bismilvinc.com',
                contact_address: 'Bismil, Diyarbakır',
                
                // Harita koordinatları
                map_latitude: '37.842249',
                map_longitude: '40.669449'
            };
            
            // Veritabanından gelen ayarları override et
            settings.forEach(setting => {
                if (publicSettings.hasOwnProperty(setting.key)) {
                    publicSettings[setting.key] = setting.value;
                }
            });
            
            return publicSettings;
        } catch (error) {
            console.error('Public ayarları alma hatası:', error);
            // Hata durumunda fallback değerler döndür
            return {
                navbar_company_name: 'Bismil Vinç',
                footer_company_name: 'Bismil Vinç',
                footer_phone: '0555 123 45 67',
                footer_email: 'info@bismilvinc.com',
                footer_address: 'Bismil, Diyarbakır'
            };
        }
    }
}

module.exports = SupabaseSettingsRepository; 