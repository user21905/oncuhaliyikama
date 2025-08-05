// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Body scroll'u engelle/etkinleştir
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }));

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Background ayarlarını güncelle
        loadDynamicImages();
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const phone = formData.get('phone');
        const email = formData.get('email');
        const service = formData.get('service');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !phone || !service) {
            showNotification('Lütfen gerekli alanları doldurun.', 'error');
            return;
        }
        
        // Phone number validation (Turkish format)
        const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            showNotification('Lütfen geçerli bir telefon numarası girin.', 'error');
            return;
        }
        
        // Email validation (if provided)
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Lütfen geçerli bir e-posta adresi girin.', 'error');
                return;
            }
        }
        
        // Simulate form submission
        showNotification('Mesajınız gönderiliyor...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.', 'success');
            contactForm.reset();
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 1rem;
        padding: 0;
        line-height: 1;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .stat, .contact-item');
    
    if (animatedElements.length > 0) {
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
});

// Phone number formatting
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.startsWith('0')) {
                value = value.substring(1);
            }
            if (value.startsWith('90')) {
                value = value.substring(2);
            }
            if (value.startsWith('5')) {
                value = value.substring(0, 10);
            }
        }
        
        // Format: 0555 123 45 67
        if (value.length >= 4) {
            value = value.substring(0, 4) + ' ' + value.substring(4);
        }
        if (value.length >= 8) {
            value = value.substring(0, 8) + ' ' + value.substring(8);
        }
        if (value.length >= 11) {
            value = value.substring(0, 11) + ' ' + value.substring(11);
        }
        
        e.target.value = value;
    });
}

// WhatsApp link enhancement
document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', function(e) {
        // Add click tracking or analytics here if needed
        console.log('WhatsApp link clicked');
    });
});

// Lazy loading for map
const mapIframe = document.querySelector('.map-container iframe');
if (mapIframe) {
    const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Load map when it comes into view
                entry.target.src = entry.target.src;
                mapObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    mapObserver.observe(mapIframe);
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 10);

window.removeEventListener('scroll', () => {});
window.addEventListener('scroll', debouncedScrollHandler); 

// Dinamik görsel yükleme
async function loadDynamicImages() {
    try {
        console.log('=== loadDynamicImages başladı ===');
        console.log('Mevcut URL:', window.location.href);
        
        const response = await fetch('/api/settings');
        console.log('API response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API response data:', data);
            
            if (data.success && data.data) {
                const settings = data.data;
                console.log('Settings object:', settings);
                
                // Anasayfa hero arka planı
                if (settings.homepage_hero_bg) {
                    console.log('Hero background URL bulundu:', settings.homepage_hero_bg);
                    const heroSection = document.getElementById('hero-section');
                    console.log('Hero section element:', heroSection);
                    
                    if (heroSection) {
                        console.log('Hero section bulundu, arka plan ayarlanıyor...');
                        
                        // Cache-busting için timestamp ekle
                        const timestamp = new Date().getTime();
                        const cacheBustedUrl = settings.homepage_hero_bg.includes('?') 
                            ? `${settings.homepage_hero_bg}&t=${timestamp}`
                            : `${settings.homepage_hero_bg}?t=${timestamp}`;
                        
                        console.log('Cache-busted background URL:', cacheBustedUrl);
                        
                        // Ekran boyutuna göre farklı ayarlar
                        const isMobile = window.innerWidth <= 768;
                        const isLargeScreen = window.innerWidth >= 1200;
                        
                        console.log('Screen size:', { width: window.innerWidth, isMobile, isLargeScreen });
                        
                        const backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${cacheBustedUrl}')`;
                        console.log('Background image CSS:', backgroundImage);
                        
                        // Görsel yüklenme durumunu kontrol et
                        const img = new Image();
                        img.onload = function() {
                            console.log('✅ Background image başarıyla yüklendi');
                            heroSection.style.backgroundImage = backgroundImage;
                            heroSection.style.backgroundSize = 'cover';
                            heroSection.style.backgroundPosition = 'center center';
                            heroSection.style.backgroundRepeat = 'no-repeat';
                            
                            // Büyük ekranlarda fixed, küçük ekranlarda scroll
                            if (isLargeScreen) {
                                heroSection.style.backgroundAttachment = 'fixed';
                            } else if (isMobile) {
                                heroSection.style.backgroundAttachment = 'scroll';
                            } else {
                                heroSection.style.backgroundAttachment = 'fixed';
                            }
                            
                            console.log('Hero section computed styles:', {
                                backgroundImage: heroSection.style.backgroundImage,
                                backgroundSize: heroSection.style.backgroundSize,
                                backgroundPosition: heroSection.style.backgroundPosition
                            });
                            
                            console.log('Hero background ayarlandı');
                        };
                        
                        img.onerror = function() {
                            console.error('❌ Background image yüklenemedi:', cacheBustedUrl);
                            // Hata durumunda varsayılan arka plan kullan
                            heroSection.style.backgroundImage = 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("/images/default-hero-bg.jpg")';
                        };
                        
                        // Görseli yüklemeye başla
                        img.src = cacheBustedUrl;
                        
                    } else {
                        console.log('Hero section bulunamadı (muhtemelen hizmet sayfasındayız)');
                    }
                } else {
                    console.log('Hero background URL bulunamadı');
                    console.log('Mevcut settings keys:', Object.keys(settings));
                    
                    // Hazır fotoğraf kaldırıldı - sadece Cloudinary'den gelen fotoğraflar kullanılacak
                    console.log('Hero background URL bulunamadı, hazır fotoğraf kullanılmıyor');
                }
                
                // Navbar logo yükleme
                if (settings.navbar_logo) {
                    console.log('Navbar logo URL bulundu:', settings.navbar_logo);
                    const navbarLogo = document.getElementById('navbar-logo');
                    if (navbarLogo) {
                        // Cache-busting için timestamp ekle
                        const timestamp = new Date().getTime();
                        const cacheBustedLogoUrl = settings.navbar_logo.includes('?') 
                            ? `${settings.navbar_logo}&t=${timestamp}`
                            : `${settings.navbar_logo}?t=${timestamp}`;
                        
                        navbarLogo.src = cacheBustedLogoUrl;
                        navbarLogo.classList.add('has-logo');
                        console.log('Navbar logo ayarlandı (cache-busted):', cacheBustedLogoUrl);
                    } else {
                        console.error('Navbar logo element bulunamadı!');
                    }
                } else {
                    console.log('Navbar logo URL bulunamadı');
                    const navbarLogo = document.getElementById('navbar-logo');
                    if (navbarLogo) {
                        navbarLogo.classList.remove('has-logo');
                    }
                }
                
                // Hizmet görselleri
                const serviceImages = {
                    'mobilvinchizmeti': settings.service_mobilvinchizmeti_img,
                    'insaatkurulumu': settings.service_insaatkurulumu_img,
                    'petrolkuyuhizmeti': settings.service_petrolkuyuhizmeti_img,
                    'petrolinsaatsahasi': settings.service_petrolinsaatsahasi_img
                };
                
                // Her hizmet için görsel güncelle
                Object.entries(serviceImages).forEach(([slug, imageUrl]) => {
                    if (imageUrl) {
                        console.log(`${slug} hizmet görseli bulundu:`, imageUrl);
                        const serviceCard = document.querySelector(`[data-service="${slug}"]`);
                        if (serviceCard) {
                            const serviceImg = serviceCard.querySelector('.service-img');
                            if (serviceImg) {
                                // Cache-busting için timestamp ekle
                                const timestamp = new Date().getTime();
                                const cacheBustedImageUrl = imageUrl.includes('?') 
                                    ? `${imageUrl}&t=${timestamp}`
                                    : `${imageUrl}?t=${timestamp}`;
                                
                                const img = new Image();
                                img.onload = function() {
                                    console.log(`✅ ${slug} hizmet görseli başarıyla yüklendi`);
                                    serviceImg.src = cacheBustedImageUrl;
                                };
                                img.onerror = function() {
                                    console.error(`❌ ${slug} hizmet görseli yüklenemedi:`, cacheBustedImageUrl);
                                };
                                img.src = cacheBustedImageUrl;
                            }
                        }
                    }
                });
                
                // İletişim bilgilerini güncelle
                updateContactInfo(settings);
                
                // Footer'ı güncelle
                updateFooter(settings);
                
            } else {
                console.error('API response başarısız:', data);
            }
        } else {
            console.error('API request başarısız:', response.status);
        }
    } catch (error) {
        console.error('loadDynamicImages hatası:', error);
    }
}

// Background image'i yenileme fonksiyonu
async function refreshBackgroundImage() {
    try {
        console.log('🔄 Background image yenileniyor...');
        
        const response = await fetch('/api/settings');
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.homepage_hero_bg) {
                const heroSection = document.getElementById('hero-section');
                if (heroSection) {
                    // Cache-busting için timestamp ekle
                    const timestamp = new Date().getTime();
                    const cacheBustedUrl = data.data.homepage_hero_bg.includes('?') 
                        ? `${data.data.homepage_hero_bg}&t=${timestamp}`
                        : `${data.data.homepage_hero_bg}?t=${timestamp}`;
                    
                    const backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${cacheBustedUrl}')`;
                    
                    // Görsel yüklenme durumunu kontrol et
                    const img = new Image();
                    img.onload = function() {
                        console.log('✅ Background image yenilendi');
                        heroSection.style.backgroundImage = backgroundImage;
                    };
                    img.onerror = function() {
                        console.error('❌ Background image yenilenemedi:', cacheBustedUrl);
                    };
                    img.src = cacheBustedUrl;
                }
            }
        }
    } catch (error) {
        console.error('Background image yenileme hatası:', error);
    }
}

// Periyodik olarak background image'i kontrol et (opsiyonel)
function startBackgroundImageCheck() {
    // Her 5 dakikada bir kontrol et
    setInterval(async () => {
        if (document.getElementById('hero-section')) {
            await refreshBackgroundImage();
        }
    }, 5 * 60 * 1000); // 5 dakika
}

// Development modunda refresh button'ı göster
function showRefreshButton() {
    const refreshBtn = document.getElementById('refresh-bg-btn');
    if (refreshBtn) {
        // Development modunda göster (localhost veya development URL'lerinde)
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.includes('vercel.app')) {
            refreshBtn.style.display = 'block';
            console.log('🛠️ Development modu: Refresh button aktif');
        }
    }
}

// Keyboard shortcuts for testing
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+R veya Cmd+R ile background image'i yenile
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            console.log('⌨️ Keyboard shortcut: Background image yenileniyor...');
            refreshBackgroundImage();
        }
        
        // F5 ile sayfa yenileme yerine background image'i yenile
        if (e.key === 'F5') {
            e.preventDefault();
            console.log('⌨️ F5: Background image yenileniyor...');
            refreshBackgroundImage();
        }
    });
}

// Admin panel'den gelen mesajları dinle
function setupMessageListener() {
    window.addEventListener('message', function(event) {
        // Güvenlik için origin kontrolü (opsiyonel)
        // if (event.origin !== window.location.origin) return;
        
        if (event.data && event.data.type === 'media-updated') {
            console.log('📢 Admin panel\'den güncelleme bildirimi alındı:', event.data);
            
            if (event.data.data && event.data.data.type === 'background-image') {
                console.log('🎨 Background image güncelleme bildirimi alındı');
                
                // Kullanıcıya bildirim göster
                showNotification('Arka plan görseli güncellendi!', 'success');
                
                // Background image'i yenile
                setTimeout(() => {
                    refreshBackgroundImage();
                }, 1000);
            }
        }
    });
}

// İletişim bilgilerini güncelle (sadece anasayfa contact section için)
function updateContactInfo(settings) {
    console.log('=== updateContactInfo başladı ===');
    console.log('Gelen settings:', settings);
    
    // Sadece anasayfa contact section'daki telefon numaralarını güncelle
    const contactTextElements = document.querySelectorAll('.contact-text');
    console.log('Bulunan contact-text elementleri:', contactTextElements.length);
    
    contactTextElements.forEach((element, index) => {
        const parentContactItem = element.closest('.contact-item');
        if (!parentContactItem) {
            console.log(`Element ${index}: parent contact-item bulunamadı`);
            return;
        }
        
        const icon = parentContactItem.querySelector('i');
        if (!icon) {
            console.log(`Element ${index}: icon bulunamadı`);
            return;
        }
        
        const iconClass = icon.className;
        console.log(`Element ${index}: icon class = ${iconClass}`);
        
        if (iconClass.includes('fa-phone')) {
            const phoneNumber = settings.contact_phone || '0555 123 45 67';
            console.log(`Element ${index}: Telefon güncelleniyor: ${element.textContent} -> ${phoneNumber}`);
            element.textContent = phoneNumber;
            
            // Parent link'i güncelle
            const parentLink = parentContactItem.closest('a[href^="tel:"]');
            if (parentLink) {
                parentLink.href = `tel:${phoneNumber}`;
                console.log(`Element ${index}: Telefon link güncellendi: ${parentLink.href}`);
            }
            
        } else if (iconClass.includes('fa-whatsapp')) {
            const whatsappNumber = settings.contact_whatsapp || '0555 123 45 67';
            console.log(`Element ${index}: WhatsApp güncelleniyor: ${element.textContent} -> ${whatsappNumber}`);
            element.textContent = whatsappNumber;
            
            // Parent link'i güncelle
            const parentLink = parentContactItem.closest('a[href*="wa.me"]');
            if (parentLink) {
                const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
                const finalNumber = cleanNumber.startsWith('90') ? cleanNumber : 
                                   cleanNumber.startsWith('0') ? '90' + cleanNumber.substring(1) : 
                                   '90' + cleanNumber;
                const message = encodeURIComponent('Merhaba! Bismil Vinç hizmetleri hakkında bilgi almak istiyorum.');
                parentLink.href = `https://wa.me/${finalNumber}?text=${message}`;
                console.log(`Element ${index}: WhatsApp link güncellendi: ${parentLink.href}`);
            }
            
        } else if (iconClass.includes('fa-envelope')) {
            const email = settings.contact_email || 'info@bismilvinc.com';
            console.log(`Element ${index}: E-posta güncelleniyor: ${element.textContent} -> ${email}`);
            element.textContent = email;
            
            // Parent link'i güncelle
            const parentLink = parentContactItem.closest('a[href^="mailto:"]');
            if (parentLink) {
                parentLink.href = `mailto:${email}`;
                console.log(`Element ${index}: E-posta link güncellendi: ${parentLink.href}`);
            }
            
        } else if (iconClass.includes('fa-map-marker-alt')) {
            const address = settings.contact_address || 'Bismil, Diyarbakır';
            console.log(`Element ${index}: Adres güncelleniyor: ${element.textContent} -> ${address}`);
            element.textContent = address;
            
        } else if (iconClass.includes('fa-clock')) {
            const workingHours = settings.footer_working_hours || '7/24 Hizmet';
            console.log(`Element ${index}: Çalışma saatleri güncelleniyor: ${element.textContent} -> ${workingHours}`);
            element.textContent = workingHours;
        }
    });

    // Hizmet sayfalarının hero section'larındaki telefon numaralarını güncelle
    const heroPhoneButtons = document.querySelectorAll('.service-hero .hero-buttons a[href^="tel:"]');
    heroPhoneButtons.forEach(element => {
        const phoneNumber = settings.contact_phone || '0555 123 45 67';
        element.href = `tel:${phoneNumber}`;
        // Telefon numarasını buton içeriğinde güncelle
        const phoneText = element.textContent.trim();
        if (phoneText.match(/\d/)) { // Eğer içerikte rakam varsa
            element.innerHTML = element.innerHTML.replace(/\d[\d\s\-\(\)]*\d/, phoneNumber);
        }
        console.log('Hero section telefon güncellendi:', phoneNumber);
    });

    // CTA section'daki telefon numaralarını da güncelle
    const ctaPhoneButtons = document.querySelectorAll('.cta-section a[href^="tel:"]');
    ctaPhoneButtons.forEach(element => {
        const phoneNumber = settings.contact_phone || '0555 123 45 67';
        element.href = `tel:${phoneNumber}`;
        // Telefon numarasını buton içeriğinde güncelle
        const phoneText = element.textContent.trim();
        if (phoneText.match(/\d/)) { // Eğer içerikte rakam varsa
            element.innerHTML = element.innerHTML.replace(/\d[\d\s\-\(\)]*\d/, phoneNumber);
        }
        console.log('CTA section telefon güncellendi:', phoneNumber);
    });

    // Google Maps iframe güncelle
    const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');
    if (mapIframe && settings.map_latitude && settings.map_longitude) {
        const newMapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d${settings.map_longitude}!3d${settings.map_latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDUwJzMyLjEiTiA0MMKwNDAnMTEuMCJF!5e0!3m2!1str!2str!4v1234567890`;
        mapIframe.src = newMapUrl;
        console.log('Harita güncellendi:', settings.map_latitude, settings.map_longitude);
    }
    
    console.log('=== updateContactInfo tamamlandı ===');
}

// Hizmet görselini güncelle
function updateServiceImage(imageUrl) {
    const heroImage = document.getElementById('service-hero-image');
    if (heroImage) {
        heroImage.src = imageUrl;
        console.log('Service image updated:', imageUrl);
    }
}

// Sayfa yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== SAYFA YÜKLENDİ ===');
    
    // Dinamik görselleri yükle
    loadDynamicImages();
    
    // Navbar scroll efekti
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', debouncedScrollHandler);
    }
    
    // Background image kontrolünü başlat
    startBackgroundImageCheck();
    
    // Development modunda refresh button'ı göster
    showRefreshButton();
    
    // Keyboard shortcuts'ları ayarla
    setupKeyboardShortcuts();
    
    // Admin panel mesajlarını dinle
    setupMessageListener();
    
    console.log('=== SAYFA YÜKLEME TAMAMLANDI ===');
}); 

// Footer'ı güncelle
function updateFooter(settings) {
    console.log('=== updateFooter başladı ===');
    console.log('Footer için gelen settings:', settings);
    
    // Şirket bilgileri
    const companyName = document.getElementById('footer-company-name');
    const description = document.getElementById('footer-description');
    if (companyName) companyName.textContent = settings.footer_company_name || 'Bismil Vinç';
    if (description) description.textContent = settings.footer_description || 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri. Güvenli, hızlı ve kaliteli çözümler.';

    // Hızlı linkler
    const homeLink = document.getElementById('footer-home-link');
    const servicesLink = document.getElementById('footer-services-link');
    const aboutLink = document.getElementById('footer-about-link');
    const contactLink = document.getElementById('footer-contact-link');
    
    if (homeLink) homeLink.textContent = settings.footer_home_link || 'Ana Sayfa';
    if (servicesLink) servicesLink.textContent = settings.footer_services_link || 'Hizmetler';
    if (aboutLink) aboutLink.textContent = settings.footer_about_link || 'Hakkımızda';
    if (contactLink) contactLink.textContent = settings.footer_contact_link || 'İletişim';

    // Hizmetler
    const service1 = document.getElementById('footer-service1');
    const service2 = document.getElementById('footer-service2');
    const service3 = document.getElementById('footer-service3');
    const service4 = document.getElementById('footer-service4');
    
    if (service1) service1.textContent = settings.footer_service1 || 'Mobil Vinç Kiralama';
    if (service2) service2.textContent = settings.footer_service2 || 'İnşaat Kurulum Hizmetleri';
    if (service3) service3.textContent = settings.footer_service3 || 'Petrol Kuyusu Hizmetleri';
    if (service4) service4.textContent = settings.footer_service4 || 'Petrol ve İnşaat Sahası';

    // İletişim bilgileri
    const footerPhone = document.getElementById('footer-phone');
    const footerPhone2 = document.getElementById('footer-phone2');
    const footerWhatsApp = document.getElementById('footer-whatsapp');
    const footerEmail = document.getElementById('footer-email');
    const footerAddress = document.getElementById('footer-address');
    const footerWorkingHours = document.getElementById('footer-working-hours');
    
    console.log('Footer telefon ayarları:');
    console.log('- settings.contact_phone:', settings.contact_phone);
    console.log('- settings.footer_phone:', settings.footer_phone);
    console.log('- settings.footer_phone2:', settings.footer_phone2);
    console.log('- settings.contact_whatsapp:', settings.contact_whatsapp);
    console.log('- settings.footer_whatsapp:', settings.footer_whatsapp);
    
    if (footerPhone) {
        const phoneNumber = settings.contact_phone || settings.footer_phone || '0555 123 45 67';
        console.log('Footer Phone 1 güncelleniyor:', phoneNumber);
        footerPhone.textContent = phoneNumber;
        footerPhone.href = `tel:${phoneNumber}`;
    }
    
    if (footerPhone2) {
        const phoneNumber2 = settings.footer_phone2 || settings.contact_phone || '0555 123 45 67';
        console.log('Footer Phone 2 güncelleniyor:', phoneNumber2);
        footerPhone2.textContent = phoneNumber2;
        footerPhone2.href = `tel:${phoneNumber2}`;
    }
    
    if (footerWhatsApp) {
        const whatsappNumber = settings.contact_whatsapp || settings.footer_whatsapp || '0555 123 45 67';
        console.log('Footer WhatsApp güncelleniyor:', whatsappNumber);
        footerWhatsApp.textContent = whatsappNumber;
        // WhatsApp link'ini temizle ve formatla
        const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
        const finalNumber = cleanNumber.startsWith('90') ? cleanNumber : 
                           cleanNumber.startsWith('0') ? '90' + cleanNumber.substring(1) : 
                           '90' + cleanNumber;
        footerWhatsApp.href = `https://wa.me/${finalNumber}?text=${encodeURIComponent('Merhaba! Bismil Vinç hizmetleri hakkında bilgi almak istiyorum.')}`;
    }
    
    if (footerEmail) {
        const emailAddress = settings.contact_email || settings.footer_email || 'info@bismilvinc.com';
        footerEmail.textContent = emailAddress;
        footerEmail.href = `mailto:${emailAddress}`;
    }
    
    if (footerAddress) footerAddress.textContent = settings.contact_address || settings.footer_address || 'Bismil, Diyarbakır';
    if (footerWorkingHours) footerWorkingHours.textContent = settings.footer_working_hours || '7/24 Hizmet';

    // Copyright
    const copyright = document.getElementById('footer-copyright');
    if (copyright) copyright.textContent = settings.footer_copyright || '© 2024 Bismil Vinç. Tüm hakları saklıdır.';

    console.log('=== updateFooter tamamlandı ===');
} 