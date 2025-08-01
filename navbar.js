// Ortak Navbar Yükleme
async function loadCommonNavbar() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const data = await response.json();
            const settings = data.data;
            
            // Navbar içeriğini güncelle
            updateNavbar(settings);
        }
    } catch (error) {
        console.error('Navbar yükleme hatası:', error);
    }
}

function updateNavbar(settings) {
    // Logo
    const navbarLogo = document.getElementById('navbar-logo');
    if (navbarLogo && settings.navbar_logo) {
        navbarLogo.src = settings.navbar_logo;
        navbarLogo.style.display = 'block';
        navbarLogo.classList.add('has-logo');
    } else if (navbarLogo) {
        // Logo yoksa gizle
        navbarLogo.style.display = 'none';
        navbarLogo.classList.remove('has-logo');
    }

    // Şirket adı
    const companyName = document.querySelector('.nav-logo h2');
    if (companyName) {
        companyName.textContent = settings.navbar_company_name || 'Bismil Vinç';
    }

    // Menü linkleri
    const homeLink = document.querySelector('.nav-menu .nav-item:nth-child(1) .nav-link');
    if (homeLink) {
        homeLink.textContent = settings.navbar_home_link || 'Ana Sayfa';
        // Ana sayfa için özel kontrol
        if (window.location.pathname === '/' || window.location.pathname === '/ANASYFA') {
            homeLink.href = '#hero-section';
        } else {
            homeLink.href = '/ANASYFA';
        }
    }

    const servicesLink = document.querySelector('.nav-menu .nav-item:nth-child(2) .nav-link');
    if (servicesLink) {
        servicesLink.textContent = settings.navbar_services_link || 'Hizmetler';
        // Ana sayfa için özel kontrol
        if (window.location.pathname === '/' || window.location.pathname === '/ANASYFA') {
            servicesLink.href = '#services';
        } else {
            servicesLink.href = '/ANASYFA#services';
        }
    }

    const aboutLink = document.querySelector('.nav-menu .nav-item:nth-child(3) .nav-link');
    if (aboutLink) {
        aboutLink.textContent = settings.navbar_about_link || 'Hakkımızda';
        // Ana sayfa için özel kontrol
        if (window.location.pathname === '/' || window.location.pathname === '/ANASYFA') {
            aboutLink.href = '#about';
        } else {
            aboutLink.href = '/ANASYFA#about';
        }
    }

    const contactLink = document.querySelector('.nav-menu .nav-item:nth-child(4) .nav-link');
    if (contactLink) {
        contactLink.textContent = settings.navbar_contact_link || 'İletişim';
        // Ana sayfa için özel kontrol
        if (window.location.pathname === '/' || window.location.pathname === '/ANASYFA') {
            contactLink.href = '#contact';
        } else {
            contactLink.href = '/ANASYFA#contact';
        }
    }
}

// Mobil menü fonksiyonları
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Menü linklerine tıklandığında menüyü kapat
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Scroll efekti
function setupScrollEffect() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Sayfa yüklendiğinde navbar'ı yükle
document.addEventListener('DOMContentLoaded', () => {
    loadCommonNavbar();
    setupMobileMenu();
    setupScrollEffect();
}); 