# Bismil Vinç - Admin Panel

Modern, güvenli ve kullanıcı dostu admin panel sistemi.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama
- JWT tabanlı güvenli giriş sistemi
- Oturum yönetimi ve token doğrulama
- Şifre hashleme (bcryptjs)
- Güvenli çıkış işlemi

### 📊 Dashboard
- Gerçek zamanlı istatistikler
- Hizmet sayısı, mesaj sayısı, medya dosyası sayısı
- Son iletişim mesajları
- Hızlı işlem butonları

### 🛠️ Hizmet Yönetimi
- Yeni hizmet ekleme
- Hizmet düzenleme ve silme
- Otomatik URL slug oluşturma
- Font Awesome ikon desteği
- Görsel yükleme

### 🎨 Tema Ayarları
- Ana renk değiştirme
- Arka plan rengi ayarlama
- Yazı tipi seçimi
- Canlı önizleme

### 📄 Sayfa İçerikleri
- Ana sayfa içerik yönetimi
- Hakkımızda sayfası düzenleme
- İletişim bilgileri güncelleme

### 📁 Medya Yönetimi
- Çoklu dosya yükleme
- Cloudinary entegrasyonu
- Dosya formatı kontrolü
- Klasör organizasyonu

### 📧 İletişim Yönetimi
- Gelen mesajları görüntüleme
- Mesaj durumu takibi
- Mesaj filtreleme ve arama

### ⚙️ Genel Ayarlar
- Site başlığı ve açıklaması
- İletişim bilgileri
- Sosyal medya linkleri
- SEO ayarları

## 🛠️ Teknik Detaylar

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid ve Flexbox
- **Vanilla JavaScript**: ES6+ features
- **Font Awesome**: İkon kütüphanesi
- **Inter Font**: Modern tipografi

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: Veritabanı
- **JWT**: Token tabanlı kimlik doğrulama
- **bcryptjs**: Şifre hashleme
- **Cloudinary**: Medya yönetimi

### Güvenlik
- **Helmet**: HTTP header güvenliği
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Form doğrulama
- **XSS Protection**: Cross-site scripting koruması

## 📁 Dosya Yapısı

```
admin/
├── index.html          # Ana admin panel sayfası
├── styles.css          # CSS stilleri
├── app.js             # JavaScript fonksiyonları
└── README.md          # Bu dosya
```

## 🚀 Kurulum

1. **Dependencies Yükleme**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ADMIN_EMAIL=admin@bismilvinc.com
   ADMIN_PASSWORD=secure_password
   ```

3. **Server Başlatma**
   ```bash
   npm run dev
   ```

4. **Admin Panel Erişimi**
   ```
   http://localhost:3000/admin
   ```

## 🔐 Giriş Bilgileri

Varsayılan admin hesabı:
- **E-posta**: `admin@bismilvinc.com`
- **Şifre**: `.env` dosyasında belirtilen şifre

## 📱 Responsive Tasarım

Admin panel tamamen responsive olarak tasarlanmıştır:
- **Desktop**: Tam özellikli sidebar
- **Tablet**: Responsive grid layout
- **Mobile**: Hamburger menü ve optimize edilmiş arayüz

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/admin/login` - Admin girişi
- `GET /api/admin/validate` - Token doğrulama

### Dashboard
- `GET /api/admin/stats` - İstatistikler
- `GET /api/admin/contacts/recent` - Son mesajlar

### Hizmetler
- `GET /api/admin/services` - Hizmetleri listele
- `POST /api/admin/services` - Yeni hizmet ekle
- `DELETE /api/admin/services/:id` - Hizmet sil

### Ayarlar
- `GET /api/admin/settings` - Ayarları getir
- `POST /api/admin/settings` - Ayarları güncelle
- `POST /api/admin/theme` - Tema ayarlarını güncelle

### Medya
- `GET /api/admin/media` - Medya dosyalarını listele
- `POST /api/admin/media/upload` - Dosya yükle

### İletişim
- `GET /api/admin/contacts` - Tüm mesajları getir

## 🎨 Tema Özelleştirme

CSS değişkenleri ile kolay özelleştirme:

```css
:root {
    --primary-color: #3b82f6;
    --primary-dark: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
}
```

## 🔒 Güvenlik Önlemleri

1. **JWT Token**: 24 saat geçerli token
2. **Password Hashing**: bcryptjs ile şifre hashleme
3. **Rate Limiting**: API rate limiting
4. **Input Validation**: Tüm form verilerinin doğrulanması
5. **CORS Protection**: Cross-origin koruması
6. **XSS Protection**: Helmet ile güvenlik başlıkları

## 📊 Performans

- **Lazy Loading**: Görsel ve içerik lazy loading
- **Compression**: Gzip sıkıştırma
- **Caching**: Browser caching
- **Minification**: CSS/JS minification (production)

## 🐛 Hata Yönetimi

- **Client-side**: Kullanıcı dostu hata mesajları
- **Server-side**: Detaylı error logging
- **Validation**: Form doğrulama hataları
- **Network**: Bağlantı hataları

## 🔄 Güncelleme ve Bakım

### Yeni Özellik Ekleme
1. Frontend: HTML/CSS/JS güncelleme
2. Backend: API endpoint ekleme
3. Database: Gerekli model güncellemeleri
4. Testing: Özellik testleri

### Güvenlik Güncellemeleri
1. Dependencies güncelleme
2. Security patches
3. Vulnerability scanning
4. Penetration testing

## 📞 Destek

Herhangi bir sorun veya öneri için:
- **E-posta**: admin@bismilvinc.com
- **Telefon**: 0555 123 45 67

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Bismil Vinç Admin Panel** - Profesyonel web sitesi yönetimi için modern çözüm. 