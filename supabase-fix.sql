-- Supabase Bağlantı Sorunu Çözümü

-- Önce mevcut policy'leri temizle
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;
DROP POLICY IF EXISTS "Settings are insertable by authenticated users" ON settings;
DROP POLICY IF EXISTS "Settings are updatable by authenticated users" ON settings;

DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users are insertable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users are updatable by authenticated users" ON users;

DROP POLICY IF EXISTS "Contacts are insertable by everyone" ON contacts;
DROP POLICY IF EXISTS "Contacts are viewable by authenticated users" ON contacts;

DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Services are insertable by authenticated users" ON services;
DROP POLICY IF EXISTS "Services are updatable by authenticated users" ON services;

-- RLS'yi geçici olarak devre dışı bırak
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Varsayılan ayarları güncelle (eğer yoksa ekle)
INSERT INTO settings (key, value) VALUES
('cloudinary_folder', 'bismil-vinc')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value; 