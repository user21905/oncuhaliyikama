-- Bismil Vinç Supabase Tabloları (Düzeltilmiş)

-- Settings tablosu
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts tablosu
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services tablosu
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ayarları
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Settings tablosu için policy (herkes okuyabilir, sadece admin yazabilir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Settings are viewable by everyone') THEN
        CREATE POLICY "Settings are viewable by everyone" ON settings FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Settings are insertable by authenticated users') THEN
        CREATE POLICY "Settings are insertable by authenticated users" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Settings are updatable by authenticated users') THEN
        CREATE POLICY "Settings are updatable by authenticated users" ON settings FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Users tablosu için policy (sadece admin erişebilir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users are viewable by authenticated users') THEN
        CREATE POLICY "Users are viewable by authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users are insertable by authenticated users') THEN
        CREATE POLICY "Users are insertable by authenticated users" ON users FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users are updatable by authenticated users') THEN
        CREATE POLICY "Users are updatable by authenticated users" ON users FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Contacts tablosu için policy (herkes ekleyebilir, sadece admin okuyabilir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Contacts are insertable by everyone') THEN
        CREATE POLICY "Contacts are insertable by everyone" ON contacts FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Contacts are viewable by authenticated users') THEN
        CREATE POLICY "Contacts are viewable by authenticated users" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Services tablosu için policy (herkes okuyabilir, sadece admin yazabilir)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Services are viewable by everyone') THEN
        CREATE POLICY "Services are viewable by everyone" ON services FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Services are insertable by authenticated users') THEN
        CREATE POLICY "Services are insertable by authenticated users" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Services are updatable by authenticated users') THEN
        CREATE POLICY "Services are updatable by authenticated users" ON services FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Varsayılan ayarları ekle
INSERT INTO settings (key, value) VALUES
('navbar_logo', ''),
('navbar_company_name', 'Bismil Vinç'),
('navbar_home_link', 'Ana Sayfa'),
('navbar_services_link', 'Hizmetler'),
('navbar_about_link', 'Hakkımızda'),
('navbar_contact_link', 'İletişim'),
('footer_company_name', 'Bismil Vinç'),
('footer_description', 'Diyarbakır''da profesyonel mobil vinç ve kurulum hizmetleri'),
('footer_phone', '0555 123 45 67'),
('footer_whatsapp', '0555 123 45 67'),
('footer_email', 'info@bismilvinc.com'),
('footer_address', 'Bismil, Diyarbakır'),
('footer_working_hours', '7/24 Hizmet'),
('service_mobilvinchizmeti_img', ''),
('service_insaatkurulumu_img', ''),
('service_petrolkuyuhizmeti_img', ''),
('service_petrolinsaatsahasi_img', ''),
('homepage_hero_bg', ''),
('contact_phone', '0555 123 45 67'),
('contact_whatsapp', '0555 123 45 67'),
('contact_email', 'info@bismilvinc.com'),
('contact_address', 'Bismil, Diyarbakır'),
('cloudinary_folder', 'bismil-vinc')
ON CONFLICT (key) DO NOTHING;

-- Varsayılan hizmetleri ekle
INSERT INTO services (title, description) VALUES
('Mobil Vinç Hizmeti', 'Profesyonel mobil vinç hizmetleri'),
('İnşaat Kurulumu', 'İnşaat alanlarında kurulum hizmetleri'),
('Petrol Kuyu Hizmeti', 'Petrol kuyularında özel hizmetler'),
('Petrol İnşaat Sahası', 'Petrol inşaat sahalarında hizmetler')
ON CONFLICT DO NOTHING; 