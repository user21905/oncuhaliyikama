# 🚀 Vercel Deployment Guide - Bismil Vinç

## 📋 Ön Gereksinimler

### ✅ Hesap Gereksinimleri
- [ ] Vercel hesabı ([vercel.com](https://vercel.com))
- [ ] GitHub/GitLab hesabı
- [ ] MongoDB Atlas hesabı
- [ ] Cloudinary hesabı
- [ ] GoDaddy domain (opsiyonel)

### ✅ Teknik Gereksinimler
- [ ] Node.js 16+ bilgisi
- [ ] Git bilgisi
- [ ] Environment variables anlayışı

## 🚀 Deployment Adımları

### 1. Proje Hazırlığı

```bash
# 1. Projeyi GitHub'a push edin
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/bismil-vinc.git
git push -u origin main
```

### 2. Vercel Hesabı Oluşturma

1. [vercel.com](https://vercel.com) adresine gidin
2. "Sign Up" butonuna tıklayın
3. GitHub/GitLab ile giriş yapın
4. Email doğrulamasını tamamlayın

### 3. Proje Import Etme

1. Vercel Dashboard'da "New Project" butonuna tıklayın
2. GitHub repository'nizi seçin (`bismil-vinc`)
3. "Import" butonuna tıklayın
4. Proje ayarlarını kontrol edin:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `./`
   - **Install Command**: `npm install`

### 4. Environment Variables Ayarlama

Vercel Dashboard'da projenizin "Settings" sekmesine gidin ve "Environment Variables" bölümünde şunları ekleyin:

```bash
# Zorunlu Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/bismilvinc?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Domain Variables (Vercel URL'nizi kullanın)
DOMAIN=https://bismil-vinc.vercel.app
SITE_URL=https://bismil-vinc.vercel.app

# Opsiyonel Variables
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_key_minimum_32_characters
```

### 5. MongoDB Atlas Ayarları

1. MongoDB Atlas Dashboard'a gidin
2. "Network Access" sekmesine gidin
3. "Add IP Address" butonuna tıklayın
4. "Allow Access from Anywhere" seçeneğini seçin (0.0.0.0/0)
5. "Confirm" butonuna tıklayın

### 6. İlk Deployment

1. Vercel Dashboard'da "Deploy" butonuna tıklayın
2. Deployment sürecini takip edin
3. Başarılı deployment sonrası URL'yi not edin

### 7. Custom Domain Bağlama (Opsiyonel)

#### GoDaddy Domain ile:

1. **GoDaddy DNS Ayarları:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   
   Type: A
   Name: @
   Value: 76.76.19.19
   TTL: 600
   ```

2. **Vercel'de Domain Ekleme:**
   - Vercel Dashboard'da projenizin "Settings" sekmesine gidin
   - "Domains" bölümünde domain'inizi ekleyin
   - DNS doğrulamasını bekleyin

## 🔍 Post-Deployment Testleri

### ✅ Temel Testler
- [ ] Ana sayfa yükleniyor: `https://your-app.vercel.app`
- [ ] Admin paneli erişilebilir: `https://your-app.vercel.app/admin`
- [ ] Contact formu çalışıyor
- [ ] Harita görünüyor
- [ ] Responsive tasarım çalışıyor

### ✅ API Testleri
- [ ] `/api/settings` endpoint çalışıyor
- [ ] `/api/contact` endpoint çalışıyor
- [ ] Admin API'leri çalışıyor

### ✅ SEO Testleri
- [ ] Meta tags doğru
- [ ] Schema.org structured data
- [ ] Canonical URL'ler
- [ ] Google PageSpeed Insights

## 📊 Monitoring ve Analytics

### ✅ Vercel Analytics
1. Vercel Dashboard'da "Analytics" sekmesine gidin
2. "Enable Analytics" butonuna tıklayın
3. Web vitals ve performans metriklerini takip edin

### ✅ Error Monitoring
1. Vercel Dashboard'da "Functions" sekmesine gidin
2. Serverless function log'larını kontrol edin
3. Error'ları takip edin

## 🔧 Troubleshooting

### ❌ Yaygın Sorunlar ve Çözümleri

#### 1. MongoDB Bağlantı Hatası
```bash
# MongoDB Atlas'ta IP whitelist'i kontrol edin
# Environment variable'da MONGODB_URI'yi kontrol edin
```

#### 2. CORS Hatası
```bash
# server.js'te CORS ayarlarını kontrol edin
# Vercel URL'sini CORS origin listesine ekleyin
```

#### 3. Environment Variables Hatası
```bash
# Vercel Dashboard'da environment variables'ları kontrol edin
# Variable isimlerinin doğru olduğundan emin olun
```

#### 4. Build Hatası
```bash
# package.json'da script'leri kontrol edin
# vercel.json konfigürasyonunu kontrol edin
```

## 📈 Performance Optimizasyonu

### ✅ Vercel Optimizasyonları
- [ ] Edge Functions kullanımı
- [ ] Automatic caching
- [ ] CDN optimization
- [ ] Image optimization

### ✅ Monitoring
- [ ] Vercel Analytics aktif
- [ ] Error tracking aktif
- [ ] Performance monitoring aktif

## 🔒 Güvenlik

### ✅ Güvenlik Kontrolleri
- [ ] JWT_SECRET güçlü ve benzersiz
- [ ] MongoDB Atlas güvenlik ayarları
- [ ] Cloudinary güvenlik ayarları
- [ ] HTTPS aktif
- [ ] Security headers aktif

## 📞 Support

### ✅ Vercel Support
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Email Support**: Pro plan için mevcut

### ✅ Emergency Contacts
- **Vercel Status**: [vercel-status.com](https://vercel-status.com)
- **MongoDB Atlas Support**: Atlas Dashboard
- **Cloudinary Support**: Cloudinary Dashboard

---

## 🎉 Başarılı Deployment!

Deployment tamamlandıktan sonra siteniz şu URL'de erişilebilir olacak:
- **Vercel URL**: `https://bismil-vinc.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (opsiyonel)

### 📊 Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

**Not**: Bu guide'ı takip ederek Vercel'de başarılı bir deployment yapabilirsiniz. Herhangi bir sorun yaşarsanız Vercel documentation'ını inceleyin. 