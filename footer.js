// Ortak Footer Yükleme
async function loadCommonFooter() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const data = await response.json();
            const settings = data.data;
            
            // Footer içeriğini güncelle
            updateFooter(settings);
        }
    } catch (error) {
        console.error('Footer yükleme hatası:', error);
    }
}

function updateFooter(settings) {
    // Şirket bilgileri
    const companyName = document.getElementById('footer-company-name');
    if (companyName) {
        companyName.textContent = settings.footer_company_name || 'Bismil Vinç';
    }

    const description = document.getElementById('footer-description');
    if (description) {
        description.textContent = settings.footer_description || 'Diyarbakır\'da profesyonel mobil vinç ve kurulum hizmetleri. Güvenli, hızlı ve kaliteli çözümler.';
    }

    // Hızlı linkler
    const homeLink = document.getElementById('footer-home-link');
    if (homeLink) {
        homeLink.textContent = settings.footer_home_link || 'Ana Sayfa';
        homeLink.href = settings.footer_home_link_url || '/ANASYFA';
    }

    const servicesLink = document.getElementById('footer-services-link');
    if (servicesLink) {
        servicesLink.textContent = settings.footer_services_link || 'Hizmetler';
        servicesLink.href = settings.footer_services_link_url || '/#services';
    }

    const aboutLink = document.getElementById('footer-about-link');
    if (aboutLink) {
        aboutLink.textContent = settings.footer_about_link || 'Hakkımızda';
        aboutLink.href = settings.footer_about_link_url || '/#about';
    }

    const contactLink = document.getElementById('footer-contact-link');
    if (contactLink) {
        contactLink.textContent = settings.footer_contact_link || 'İletişim';
        contactLink.href = settings.footer_contact_link_url || '/#contact';
    }

    // Hizmetler
    const service1 = document.getElementById('footer-service1');
    const service2 = document.getElementById('footer-service2');
    const service3 = document.getElementById('footer-service3');
    const service4 = document.getElementById('footer-service4');
    
    if (service1) {
        service1.textContent = settings.footer_service1 || 'Halı Yıkama';
        service1.href = settings.footer_service1_url || '/hali-yikama';
    }
    if (service2) {
        service2.textContent = settings.footer_service2 || 'Koltuk Yıkama';
        service2.href = settings.footer_service2_url || '/koltuk-yikama';
    }
    if (service3) {
        service3.textContent = settings.footer_service3 || 'Perde Yıkama';
        service3.href = settings.footer_service3_url || '/perde-yikama';
    }
    if (service4) {
        service4.textContent = settings.footer_service4 || 'Yorgan ve Battaniye Yıkama';
        service4.href = settings.footer_service4_url || '/yorgan-battaniye-yikama';
    }

    // İletişim bilgileri
    const phone = document.getElementById('footer-phone');
    if (phone) {
        const phoneNumber = settings.footer_phone || '0555 123 45 67';
        phone.textContent = phoneNumber;
        phone.href = `tel:${phoneNumber.replace(/\s/g, '')}`;
    }

    const phone2 = document.getElementById('footer-phone2');
    if (phone2) {
        const phoneNumber2 = settings.footer_phone2 || '0555 123 45 67';
        phone2.textContent = phoneNumber2;
        phone2.href = `tel:${phoneNumber2.replace(/\s/g, '')}`;
    }

    const whatsapp = document.getElementById('footer-whatsapp');
    if (whatsapp) {
        const whatsappNumber = settings.footer_whatsapp || '0555 123 45 67';
        whatsapp.textContent = whatsappNumber;
        const cleanNumber = whatsappNumber.replace(/\s/g, '');
        whatsapp.href = `https://wa.me/90${cleanNumber}?text=Merhaba, hizmetleriniz hakkında bilgi almak istiyorum.`;
    }

    const email = document.getElementById('footer-email');
    if (email) {
        const emailAddress = settings.footer_email || 'info@bismilvinc.com';
        email.textContent = emailAddress;
        email.href = `mailto:${emailAddress}`;
    }

    const address = document.getElementById('footer-address');
    if (address) {
        address.textContent = settings.footer_address || 'Bismil, Diyarbakır';
    }

    const workingHours = document.getElementById('footer-working-hours');
    if (workingHours) {
        workingHours.textContent = settings.footer_working_hours || '7/24 Hizmet';
    }

    // Copyright
    const copyright = document.getElementById('footer-copyright');
    if (copyright) {
        copyright.textContent = settings.footer_copyright || '© 2024 Bismil Vinç. Tüm hakları saklıdır.';
    }
}

// Sayfa yüklendiğinde footer'ı yükle
document.addEventListener('DOMContentLoaded', loadCommonFooter); 