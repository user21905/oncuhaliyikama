# Bismil Vinç - Diyarbakır Mobil Vinç Hizmetleri

Diyarbakır'da 16 yıllık deneyimle mobil vinç kiralama ve şantiye kaldırma hizmetleri sunan Bismil Vinç'in resmi web sitesi.

## 🚀 Vercel Deployment

Bu proje Vercel üzerinde deploy edilmiştir. Vercel, modern web uygulamaları için optimize edilmiş bir platformdur.

### 🌐 Canlı Site
- **Vercel URL**: `https://bismil-vinc.vercel.app`
- **Custom Domain**: `https://yourdomain.com` (opsiyonel)

### ✨ Vercel Avantajları
- **Ücretsiz Plan**: Aylık 100GB bandwidth
- **Otomatik SSL**: HTTPS otomatik olarak sağlanır
- **Global CDN**: Dünya çapında hızlı yükleme
- **Otomatik Deployment**: Git entegrasyonu ile otomatik güncelleme
- **Edge Functions**: Hızlı API responses
- **Analytics**: Performans takibi

## 🛠️ Teknik Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript**: Vanilla JS with ES6+ features
- **Font Awesome**: Icons
- **Google Fonts**: Inter font family

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB Atlas**: Cloud database
- **Cloudinary**: Image storage
- **JWT**: Authentication

### Deployment
- **Vercel**: Hosting platform
- **GitHub**: Version control
- **MongoDB Atlas**: Database hosting
- **Cloudinary**: Media hosting

## 📁 Proje Yapısı

```
bismil-vinc/
├── server.js                 # Express server
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── index.html               # Main HTML file
├── styles.css               # CSS styles
├── script.js                # Main JavaScript
├── navbar.js                # Navbar functionality
├── footer.js                # Footer functionality
├── admin/                   # Admin panel files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── database/                # Database files
│   ├── connection.js
│   ├── models/
│   └── repositories/
├── services/                # External services
│   └── cloudinary.js
├── middleware/              # Express middleware
└── README.md               # This file
```

## 🚀 Yerel Geliştirme

### Gereksinimler
- Node.js 16+
- MongoDB Atlas hesabı
- Cloudinary hesabı

### Kurulum

1. **Projeyi klonlayın**
   ```bash
   git clone https://github.com/yourusername/bismil-vinc.git
   cd bismil-vinc
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment variables'ları ayarlayın**
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin
   ```

4. **Uygulamayı başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**
   ```
   http://localhost:3000
   ```

## 📊 Performance

### Core Web Vitals
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### SEO Optimizasyonu
- Schema.org structured data
- Meta tags optimization
- Canonical URLs
- Sitemap generation
- Open Graph tags

## 🔒 Güvenlik

- JWT authentication
- Helmet.js security headers
- CORS configuration
- Input validation
- Rate limiting
- MongoDB injection protection

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 480px, 768px, 1200px
- Touch-friendly interface
- Optimized for all devices

## 🎨 Tasarım Özellikleri

- Modern, minimalist design
- Professional color scheme
- Smooth animations
- Accessibility compliant
- Cross-browser compatible

## 📞 İletişim

- **Website**: https://bismil-vinc.vercel.app
- **Email**: info@yourdomain.com
- **Phone**: +90 555 123 45 67

## 📄 Lisans

Bu proje Bismil Vinç'e aittir. Tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

**Deployment Guide**: Detaylı deployment rehberi için `VERCEL_DEPLOYMENT_GUIDE.md` dosyasını inceleyin. 