# Vercel Environment Variables

Bu dosyada Vercel'de ayarlanması gereken environment variables'lar listelenmiştir.

## 🔧 Vercel Dashboard'da Ayarlanacak Environment Variables

### Supabase Veritabanı
```
SUPABASE_URL=https://amstarhyztgcjldtqkek.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtc3Rhcmh5enRnY2psZHRxa2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTczNDIsImV4cCI6MjA2OTczMzM0Mn0.21jM442VWRv2aABBSnwt7XBXQrwrf_SVB
```

### Cloudinary Medya Yükleme
```
CLOUDINARY_CLOUD_NAME=dhslapns1
CLOUDINARY_API_KEY=277186752262788
CLOUDINARY_API_SECRET=mqb09T4lY_cKDU1d1cD5esCTtPg
```

### JWT Kimlik Doğrulama
```
JWT_SECRET=FHquVHL/i9jrMQMSwrd+D2IB90qp0KQlDlPGWtzPtTQCYPjJmSkOIU3kxOF/q0j4YxrNSY4GdkqnQ6CEMgOXDw==
```

### Admin Panel Bilgileri
```
ADMIN_EMAIL=admin@bismilvinc.com
ADMIN_PASSWORD=BismilVinc2024!
```

### Environment
```
NODE_ENV=production
```

## 📋 Vercel'de Ayarlama Adımları

1. **Vercel Dashboard'a gidin**
2. **Projenizi seçin**
3. **Settings > Environment Variables bölümüne gidin**
4. **Her environment variable'ı ekleyin:**
   - Name: Environment variable adı
   - Value: Environment variable değeri
   - Environment: Production (veya All)
5. **Save butonuna tıklayın**
6. **Redeploy yapın**

## 🔍 Kontrol Edilecek Noktalar

### ✅ Supabase Bağlantısı
- Supabase URL doğru mu?
- ANON_KEY geçerli mi?
- Supabase Auth kullanıcısı oluşturuldu mu?

### ✅ Cloudinary Bağlantısı
- Cloud Name doğru mu?
- API Key ve Secret geçerli mi?
- Upload preset ayarlandı mı?

### ✅ Admin Panel
- Admin kullanıcısı Supabase Auth'da oluşturuldu mu?
- Email doğrulaması yapıldı mı?
- Login endpoint çalışıyor mu?

## 🚨 Önemli Notlar

1. **JWT_SECRET** production'da güçlü ve benzersiz olmalı
2. **ADMIN_PASSWORD** güçlü bir şifre olmalı
3. **SUPABASE_ANON_KEY** public olabilir ama güvenli tutulmalı
4. **CLOUDINARY_API_SECRET** gizli tutulmalı

## 🔧 Sorun Giderme

### Login Hatası (401)
- Supabase Auth kullanıcısı oluşturuldu mu?
- Email doğrulaması yapıldı mı?
- Şifre doğru mu?

### Token Hatası (jwt malformed)
- JWT_SECRET doğru mu?
- Token formatı doğru mu?

### Cloudinary Hatası
- API bilgileri doğru mu?
- Upload preset ayarlandı mı? 