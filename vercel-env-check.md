# Vercel Environment Variables Kontrol Listesi

## Gerekli Environment Variables:

### 1. Supabase Bağlantısı
- `SUPABASE_URL` - Supabase proje URL'si
- `SUPABASE_ANON_KEY` - Supabase anonim anahtarı

### 2. Admin Giriş Bilgileri
- `ADMIN_EMAIL` = `admin@bismilvinc.com`
- `ADMIN_PASSWORD` = `BismilVinc2024!`
- `JWT_SECRET` - JWT token için gizli anahtar (en az 32 karakter)

### 3. Cloudinary Ayarları
- `CLOUDINARY_CLOUD_NAME` - Cloudinary bulut adı
- `CLOUDINARY_API_KEY` - Cloudinary API anahtarı
- `CLOUDINARY_API_SECRET` - Cloudinary API gizli anahtarı

## Vercel Dashboard'da Kontrol Edilecek:

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables
4. Yukarıdaki tüm değişkenlerin mevcut olduğunu kontrol edin
5. `ADMIN_EMAIL` ve `ADMIN_PASSWORD` değerlerini güncelleyin

## Supabase'de Yapılacaklar:

1. Supabase Dashboard'a gidin
2. SQL Editor'ı açın
3. `create-admin-user.sql` dosyasındaki kodu çalıştırın
4. Admin kullanıcısının oluşturulduğunu kontrol edin

## Test Giriş Bilgileri:
- **Email:** admin@bismilvinc.com
- **Şifre:** BismilVinc2024! 