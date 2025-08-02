-- Admin kullanıcısı oluşturma scripti
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Önce mevcut admin kullanıcısını kontrol et ve sil (eğer varsa)
DELETE FROM users WHERE email = 'admin@bismilvinc.com';

-- Yeni admin kullanıcısı oluştur
-- Şifre: BismilVinc2024! (bcrypt ile hashlenmiş)
INSERT INTO users (email, password, name, role, created_at, updated_at) VALUES (
    'admin@bismilvinc.com',
    '$2a$10$1IYY8AoY2FLgB0CveSf4gu1UV6F4QOUYMC.UI23Z56Dl4HrzUDi7C', -- 'BismilVinc2024!' şifresi
    'Admin',
    'admin',
    NOW(),
    NOW()
);

-- Kontrol et
SELECT id, email, name, role, created_at FROM users WHERE email = 'admin@bismilvinc.com'; 