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
                        
                        // Ekran boyutuna göre farklı ayarlar
                        const isMobile = window.innerWidth <= 768;
                        const isLargeScreen = window.innerWidth >= 1200;
                        
                        console.log('Screen size:', { width: window.innerWidth, isMobile, isLargeScreen });
                        
                        const backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${settings.homepage_hero_bg}')`;
                        console.log('Background image CSS:', backgroundImage);
                        
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
                    } else {
                        console.log('Hero section bulunamadı (muhtemelen hizmet sayfasındayız)');
                    }
                } else {
                    console.log('Hero background URL bulunamadı');
                    console.log('Mevcut settings keys:', Object.keys(settings));
                    
                    // Geçici test görseli (API'den veri gelmediğinde) - sadece anasayfada
                    const heroSection = document.getElementById('hero-section');
                    if (heroSection) {
                        console.log('Test görseli ekleniyor...');
                        heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`;
                        heroSection.style.backgroundSize = 'cover';
                        heroSection.style.backgroundPosition = 'center center';
                        heroSection.style.backgroundRepeat = 'no-repeat';
                        console.log('Test görseli eklendi');
                    }
                }
                
                // Navbar logo yükleme
                if (settings.navbar_logo) {
                    console.log('Navbar logo URL bulundu:', settings.navbar_logo);
                    const navbarLogo = document.getElementById('navbar-logo');
                    if (navbarLogo) {
                        navbarLogo.src = settings.navbar_logo;
                        navbarLogo.classList.add('has-logo');
                        console.log('Navbar logo ayarlandı');
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

                // Hizmet kartlarındaki görselleri güncelle
                Object.keys(serviceImages).forEach(slug => {
                    const imageUrl = serviceImages[slug];
                    if (imageUrl) {
                        const serviceCard = document.querySelector(`[data-service-slug="${slug}"]`);
                        if (serviceCard) {
                            const serviceImg = serviceCard.querySelector('.service-img');
                            if (serviceImg) {
                                serviceImg.src = imageUrl;
                                console.log(`${slug} hizmet görseli güncellendi:`, imageUrl);
                            }
                        }
                    }
                });

                // İletişim bilgilerini güncelle
                updateContactInfo(settings);
                
                // Footer'ı güncelle
                updateFooter(settings);
                
                // Hizmet sayfalarında görsel yükleme
                const currentPath = window.location.pathname;
                console.log('Current path:', currentPath);
                
                if (currentPath.includes('mobilvinchizmeti') && serviceImages.mobilvinchizmeti) {
                    updateServiceImage(serviceImages.mobilvinchizmeti);
                } else if (currentPath.includes('insaatkurulumu') && serviceImages.insaatkurulumu) {
                    updateServiceImage(serviceImages.insaatkurulumu);
                } else if (currentPath.includes('petrolkuyuhizmeti') && serviceImages.petrolkuyuhizmeti) {
                    updateServiceImage(serviceImages.petrolkuyuhizmeti);
                } else if (currentPath.includes('petrolinsaatsahasi') && serviceImages.petrolinsaatsahasi) {
                    updateServiceImage(serviceImages.petrolinsaatsahasi);
                }
            } else {
                console.error('API response başarısız:', data);
            }
        } else {
            console.error('API response hatası:', response.status);
        }
    } catch (error) {
        console.error('loadDynamicImages hatası:', error);
    }
    
    console.log('=== loadDynamicImages tamamlandı ===');
}

// İletişim bilgilerini güncelle
function updateContactInfo(settings) {
    console.log('İletişim bilgileri güncelleniyor:', settings);
    
    // Telefon numarası - tıklanabilir kartlar için
    const phoneCards = document.querySelectorAll('a[href^="tel:"]');
    phoneCards.forEach(element => {
        const phoneNumber = settings.contact_phone || settings.phone_number || '0555 123 45 67';
        element.href = `tel:${phoneNumber}`;
        const textElement = element.querySelector('.contact-text');
        if (textElement) {
            textElement.textContent = phoneNumber;
        }
        console.log('Telefon kartı güncellendi:', phoneNumber);
    });

    // Hizmet sayfalarının hero section'larındaki telefon numaralarını güncelle
    const heroPhoneButtons = document.querySelectorAll('.service-hero .hero-buttons a[href^="tel:"]');
    heroPhoneButtons.forEach(element => {
        const phoneNumber = settings.contact_phone || settings.phone_number || '0555 123 45 67';
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
        const phoneNumber = settings.contact_phone || settings.phone_number || '0555 123 45 67';
        element.href = `tel:${phoneNumber}`;
        // Telefon numarasını buton içeriğinde güncelle
        const phoneText = element.textContent.trim();
        if (phoneText.match(/\d/)) { // Eğer içerikte rakam varsa
            element.innerHTML = element.innerHTML.replace(/\d[\d\s\-\(\)]*\d/, phoneNumber);
        }
        console.log('CTA section telefon güncellendi:', phoneNumber);
    });

    // WhatsApp numarası - tıklanabilir kartlar için
    const whatsappCards = document.querySelectorAll('a[href*="wa.me"]');
    whatsappCards.forEach(element => {
        const whatsappNumber = settings.contact_whatsapp || settings.whatsapp_number || settings.phone_number || '0555 123 45 67';
        // Numarayı temizle: boşlukları, tireleri ve parantezleri kaldır
        const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
        // Türkiye ülke kodu ekle (eğer yoksa)
        const finalNumber = cleanNumber.startsWith('90') ? cleanNumber : 
                           cleanNumber.startsWith('0') ? '90' + cleanNumber.substring(1) : 
                           '90' + cleanNumber;
        // WhatsApp sohbetine doğrudan yönlendir
        const message = encodeURIComponent('Merhaba! Bismil Vinç hizmetleri hakkında bilgi almak istiyorum.');
        element.href = `https://wa.me/${finalNumber}?text=${message}`;
        const textElement = element.querySelector('.contact-text');
        if (textElement) {
            textElement.textContent = whatsappNumber;
        }
        console.log('WhatsApp kartı güncellendi:', whatsappNumber, '->', finalNumber);
    });

    // E-posta
    const emailElements = document.querySelectorAll('a[href^="mailto:"]');
    emailElements.forEach(element => {
        const email = settings.contact_email || settings.email_address || 'info@bismilvinc.com';
        element.href = `mailto:${email}`;
        element.textContent = email;
        console.log('E-posta güncellendi:', email);
    });

    // Adres - daha spesifik seçiciler
    const addressElements = document.querySelectorAll('.contact-details p');
    addressElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.includes('Bismil') || text.includes('Diyarbakır') || text.includes('Türkiye')) {
            const address = settings.contact_address || settings.address || 'Bismil, Diyarbakır';
            element.textContent = address;
            console.log('Adres güncellendi:', address);
        }
    });

    // Çalışma saatleri - daha spesifik seçiciler
    const workingHoursElements = document.querySelectorAll('.contact-details p');
    workingHoursElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.includes('7/24') || text.includes('Hizmet') || text.includes('Çalışma')) {
            const workingHours = settings.footer_working_hours || settings.working_hours || '7/24 Hizmet';
            element.textContent = workingHours;
            console.log('Çalışma saatleri güncellendi:', workingHours);
        }
    });

    // Google Maps iframe güncelle
    const mapIframe = document.querySelector('iframe[src*="google.com/maps"]');
    if (mapIframe && settings.map_latitude && settings.map_longitude) {
        const newMapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345.67890!2d${settings.map_longitude}!3d${settings.map_latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDUwJzMyLjEiTiA0MMKwNDAnMTEuMCJF!5e0!3m2!1str!2str!4v1234567890`;
        mapIframe.src = newMapUrl;
        console.log('Harita güncellendi:', settings.map_latitude, settings.map_longitude);
    }
    
    // Footer'daki iletişim bilgilerini güncelle
    const footerPhoneElements = document.querySelectorAll('.footer-section a[href^="tel:"]');
    footerPhoneElements.forEach(element => {
        const phoneNumber = settings.phone_number || '0555 123 45 67';
        element.href = `tel:${phoneNumber}`;
        element.textContent = phoneNumber;
        console.log('Footer telefon güncellendi:', phoneNumber);
    });

    const footerAddressElements = document.querySelectorAll('.footer-section p');
    footerAddressElements.forEach(element => {
        const text = element.textContent.trim();
        if (text.includes('Bismil') || text.includes('Diyarbakır')) {
            const address = settings.address || 'Bismil, Diyarbakır';
            element.textContent = element.textContent.replace(/Bismil.*Diyarbakır.*/, address);
            console.log('Footer adres güncellendi:', address);
        }
        if (text.includes('7/24') || text.includes('Hizmet')) {
            const workingHours = settings.footer_working_hours || settings.working_hours || '7/24 Hizmet';
            element.textContent = element.textContent.replace(/7\/24.*Hizmet.*/, workingHours);
            console.log('Footer çalışma saatleri güncellendi:', workingHours);
        }
    });
    
    // Footer'ı güncelle
    updateFooter(settings);

    console.log('İletişim bilgileri güncelleme tamamlandı');
}

// Hizmet görselini güncelle
function updateServiceImage(imageUrl) {
    const heroImage = document.querySelector('.service-hero .hero-image img');
    if (heroImage) {
        heroImage.src = imageUrl;
        console.log('Service image updated:', imageUrl);
    }
}

// Sayfa yüklendiğinde dinamik görselleri yükle
document.addEventListener('DOMContentLoaded', function() {
    loadDynamicImages();
}); 

// Footer'ı güncelle
function updateFooter(settings) {
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
    
    if (footerPhone) {
        const phoneNumber = settings.footer_phone || '0555 123 45 67';
        footerPhone.textContent = phoneNumber;
        footerPhone.href = `tel:${phoneNumber}`;
    }
    
    if (footerPhone2) {
        const phoneNumber2 = settings.footer_phone2 || '0555 123 45 67';
        footerPhone2.textContent = phoneNumber2;
        footerPhone2.href = `tel:${phoneNumber2}`;
    }
    
    if (footerWhatsApp) {
        const whatsappNumber = settings.footer_whatsapp || '0555 123 45 67';
        footerWhatsApp.textContent = whatsappNumber;
        // WhatsApp link'ini temizle ve formatla
        const cleanNumber = whatsappNumber.replace(/[\s\-\(\)]/g, '');
        const finalNumber = cleanNumber.startsWith('90') ? cleanNumber : 
                           cleanNumber.startsWith('0') ? '90' + cleanNumber.substring(1) : 
                           '90' + cleanNumber;
        footerWhatsApp.href = `https://wa.me/${finalNumber}?text=${encodeURIComponent('Merhaba! Bismil Vinç hizmetleri hakkında bilgi almak istiyorum.')}`;
    }
    
    if (footerEmail) {
        const emailAddress = settings.footer_email || 'info@bismilvinc.com';
        footerEmail.textContent = emailAddress;
        footerEmail.href = `mailto:${emailAddress}`;
    }
    
    if (footerAddress) footerAddress.textContent = settings.footer_address || 'Bismil, Diyarbakır';
    if (footerWorkingHours) footerWorkingHours.textContent = settings.footer_working_hours || '7/24 Hizmet';

    // Copyright
    const copyright = document.getElementById('footer-copyright');
    if (copyright) copyright.textContent = settings.footer_copyright || '© 2024 Bismil Vinç. Tüm hakları saklıdır.';

    console.log('Footer güncellendi');
} 