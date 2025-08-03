const supabaseConnection = require('../supabase-connection');
const bcrypt = require('bcryptjs');

class SupabaseUserRepository {
    constructor() {
        this.tableName = 'users';
    }

    async connect() {
        return await supabaseConnection.connect();
    }

    async create(userData) {
        try {
            const supabase = await this.connect();
            
            // Şifreyi hashle ve password_hash olarak kaydet
            if (userData.password) {
                userData.password_hash = await bcrypt.hash(userData.password, 10);
                delete userData.password;
            }
            
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([userData])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('User oluşturma hatası:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('id, email, role, created_at, updated_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('User listesi alma hatası:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('id, email, role, created_at, updated_at')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('User bulma hatası:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const supabase = await this.connect();
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('User email bulma hatası:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const supabase = await this.connect();
            
            // Şifre güncelleniyorsa hashle
            if (updateData.password) {
                updateData.password_hash = await bcrypt.hash(updateData.password, 10);
                delete updateData.password;
            }
            
            const { data, error } = await supabase
                .from(this.tableName)
                .update(updateData)
                .eq('id', id)
                .select('id, email, role, created_at, updated_at');

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('User güncelleme hatası:', error);
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
            console.error('User silme hatası:', error);
            throw error;
        }
    }

    async authenticate(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return { success: false, message: 'Kullanıcı bulunamadı' };
            }

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return { success: false, message: 'Geçersiz şifre' };
            }

            return { 
                success: true, 
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            console.error('Kullanıcı doğrulama hatası:', error);
            return { success: false, message: 'Doğrulama hatası' };
        }
    }

    async initializeDefaultAdmin() {
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            
            if (!adminEmail || !adminPassword) {
                console.log('⚠️ ADMIN_EMAIL veya ADMIN_PASSWORD environment variable eksik, admin oluşturulamıyor');
                return;
            }
            
            const supabase = await this.connect();
            
            // Admin kullanıcısını kontrol et
            const { data: existingAdmin, error: checkError } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('email', adminEmail)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            // Eğer admin yoksa oluştur
            if (!existingAdmin) {
                const adminData = {
                    email: adminEmail,
                    password: adminPassword,
                    role: 'admin'
                };

                await this.create(adminData);
                console.log('✅ Default admin kullanıcısı oluşturuldu:', adminEmail);
            } else {
                console.log('✅ Admin kullanıcısı zaten mevcut:', adminEmail);
            }
        } catch (error) {
            console.error('Default admin oluşturma hatası:', error);
            throw error;
        }
    }

    async changePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const supabase = await this.connect();
            
            const { error } = await supabase
                .from(this.tableName)
                .update({ password_hash: hashedPassword })
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            throw error;
        }
    }
}

module.exports = SupabaseUserRepository; 