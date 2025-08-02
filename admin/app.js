// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('adminToken');
        this.lastValidationTime = 0;
        this.validationInProgress = false;
        this.init();
    }

    init() {
        console.log('=== ADMIN PANEL INIT BAŞLADI ===');
        this.setupEventListeners();
        this.checkAuth();
        this.loadDashboardStats();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Service form
        const serviceForm = document.getElementById('serviceForm');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleServiceSubmit();
            });
        }

        // Theme form
        const themeForm = document.getElementById('themeForm');
        if (themeForm) {
            themeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleThemeSubmit();
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsSubmit();
            });
        }

        // Media upload form
        const mediaUploadForm = document.getElementById('media-upload-form');
        if (mediaUploadForm) {
            mediaUploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMediaUpload();
            });
        }

        // Media file input change
        const mediaFileInput = document.getElementById('media-file');
        if (mediaFileInput) {
            mediaFileInput.addEventListener('change', (e) => {
                this.handleMediaFileSelect(e);
            });
        }

        // Service slug auto-generation
        document.getElementById('serviceName').addEventListener('input', (e) => {
            this.generateSlug(e.target.value);
        });

        // Sayfa düzenleme formu
        const pageEditForm = document.getElementById('pageEditForm');
        if (pageEditForm) {
            pageEditForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePageEditSubmit();
            });
        }

        // Sayfa kartları için event listener
        document.addEventListener('click', (e) => {
            // Sayfa kartları
            if (e.target.closest('.page-card')) {
                const pageCard = e.target.closest('.page-card');
                const pageType = pageCard.getAttribute('data-page-type');
                if (pageType) {
                    this.editPage(pageType);
                }
            }

            // Modal kapatma butonları
            if (e.target.closest('[data-action]')) {
                const action = e.target.closest('[data-action]').getAttribute('data-action');
                switch (action) {
                    case 'close-service-modal':
                        this.closeServiceModal();
                        break;
                    case 'close-page-edit-modal':
                        this.closePageEditModal();
                        break;
                    case 'close-media-upload-modal':
                        this.closeMediaUpload();
                        break;
                    case 'open-service-modal':
                        this.openServiceModal();
                        break;
                    case 'show-services':
                        this.showSection('services');
                        break;
                    case 'show-media':
                        this.showSection('media');
                        break;
                    case 'show-theme':
                        this.showSection('theme');
                        break;
                    case 'edit-service':
                        const serviceId = e.target.closest('[data-action]').getAttribute('data-service-id');
                        this.editService(serviceId);
                        break;
                    case 'delete-service':
                        const deleteServiceId = e.target.closest('[data-action]').getAttribute('data-service-id');
                        this.deleteService(deleteServiceId);
                        break;
                }
            }
        });

        // ESC tuşu ile modal kapatma
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="flex"]');
                if (openModal) {
                    if (openModal.id === 'pageEditModal') {
                        this.closePageEditModal();
                    } else if (openModal.id === 'serviceModal') {
                        this.closeServiceModal();
                    } else if (openModal.id === 'mediaUploadModal') {
                        this.closeMediaUpload();
                    }
                }
            }
        });

        // Modal dışına tıklayarak kapatma
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'pageEditModal') {
                    this.closePageEditModal();
                } else if (e.target.id === 'serviceModal') {
                    this.closeServiceModal();
                } else if (e.target.id === 'mediaUploadModal') {
                    this.closeMediaUpload();
                }
            }
        });

        // Footer form
        const footerForm = document.getElementById('footerForm');
        if (footerForm) {
            footerForm.addEventListener('submit', (e) => this.handleFooterSubmit(e));
        }

        // Navbar form
        const navbarForm = document.getElementById('navbarForm');
        if (navbarForm) {
            navbarForm.addEventListener('submit', (e) => this.handleNavbarSubmit(e));
        }

        // Service modal close buttons
    }

    checkAuth() {
        console.log('=== CHECK AUTH ÇAĞRILDI ===');
        console.log('Token var mı:', !!this.token);
        console.log('Son validation zamanı:', this.lastValidationTime);
        console.log('Validation devam ediyor mu:', this.validationInProgress);
        
        if (this.token) {
            // Eğer son 5 saniye içinde validation yapıldıysa, tekrar yapma
            const now = Date.now();
            if (now - this.lastValidationTime < 5000) {
                console.log('Validation çok yakın zamanda yapıldı, atlanıyor');
                return;
            }
            
            // Eğer validation devam ediyorsa, tekrar başlatma
            if (this.validationInProgress) {
                console.log('Validation zaten devam ediyor, atlanıyor');
                return;
            }
            
            this.validateToken();
        } else {
            console.log('Token yok, login ekranı gösteriliyor');
            this.showLogin();
        }
    }

    async validateToken() {
        console.log('=== VALIDATE TOKEN BAŞLADI ===');
        console.log('Token değeri:', this.token);
        console.log('Token uzunluğu:', this.token ? this.token.length : 0);
        
        // Validation'ın devam ettiğini işaretle
        this.validationInProgress = true;
        this.lastValidationTime = Date.now();
        
        try {
            const response = await fetch('/api/admin/validate', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            console.log('Validation response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                console.log('Validation başarılı, dashboard gösteriliyor');
                this.showDashboard();
            } else {
                console.log('Validation başarısız, login ekranı gösteriliyor');
                this.showLogin();
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.showLogin();
        } finally {
            // Validation'ın bittiğini işaretle
            this.validationInProgress = false;
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        console.log('=== FRONTEND LOGIN BAŞLADI ===');
        console.log('Giriş bilgileri:', { email, password: password ? '***' : 'boş' });

        try {
            const requestBody = { email, password };
            console.log('Request body:', requestBody);

            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                console.log('Login başarılı, token alındı');
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('adminToken', this.token);
                console.log('Token localStorage\'a kaydedildi');
                this.showDashboard();
                this.showMessage('Başarıyla giriş yapıldı!', 'success');
            } else {
                console.log('Login başarısız:', data.message);
                errorDiv.textContent = data.message || 'Giriş başarısız';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('=== FRONTEND LOGIN HATASI ===');
            console.error('Login error:', error);
            errorDiv.textContent = 'Bağlantı hatası: ' + error.message;
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        this.showSection('dashboard');
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    }

    showSection(sectionName) {
        // Tüm content section'ları gizle
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Tüm nav link'leri pasif yap
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Seçilen section'ı göster
        let targetSection;
        switch (sectionName) {
            case 'dashboard':
                targetSection = document.getElementById('dashboardSection');
                break;
            case 'services':
                targetSection = document.getElementById('servicesSection');
                break;
            case 'pages':
                targetSection = document.getElementById('pagesSection');
                break;
            case 'theme':
                targetSection = document.getElementById('themeSection');
                break;
            case 'media':
                targetSection = document.getElementById('mediaSection');
                break;
            case 'contacts':
                targetSection = document.getElementById('contactsSection');
                break;
            case 'footer':
                targetSection = document.getElementById('footerSection');
                break;
            case 'navbar':
                targetSection = document.getElementById('navbarSection');
                break;
            case 'settings':
                targetSection = document.getElementById('settingsSection');
                break;
            default:
                targetSection = document.getElementById('dashboardSection');
        }

        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Nav link'i aktif yap
        const activeNavLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        // Sayfa başlığını güncelle
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            const titles = {
                dashboard: 'Dashboard',
                services: 'Hizmet Yönetimi',
                pages: 'Sayfa İçerikleri',
                theme: 'Tema Ayarları',
                media: 'Medya Yönetimi',
                contacts: 'İletişim Mesajları',
                footer: 'Footer Yönetimi',
                navbar: 'Navbar Yönetimi',
                settings: 'Genel Ayarlar'
            };
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }

        // Section verilerini yükle
        this.loadSectionData(sectionName);
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                await this.loadDashboardStats();
                await this.loadRecentContacts();
                break;
            case 'services':
                await this.loadServices();
                break;
            case 'media':
                await this.loadMedia();
                break;
            case 'contacts':
                await this.loadContacts();
                break;
            case 'settings':
                await this.loadSettings();
                break;
            case 'footer':
                await this.loadFooterData();
                break;
            case 'navbar':
                this.loadNavbarData();
                break;
            default:
                break;
        }
    }

    async loadDashboardStats() {
        try {
            console.log('=== LOAD DASHBOARD STATS BAŞLADI ===');
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            console.log('Stats response status:', response.status);
            
            if (response.ok) {
                const stats = await response.json();
                console.log('Stats data:', stats);
                
                document.getElementById('servicesCount').textContent = stats.services || 0;
                document.getElementById('contactsCount').textContent = stats.contacts || 0;
                document.getElementById('pageViews').textContent = stats.pageViews || 0;
                document.getElementById('mediaCount').textContent = stats.media || 0;
            } else {
                console.error('Stats response not ok:', response.status);
                // Fallback değerler
                document.getElementById('servicesCount').textContent = '0';
                document.getElementById('contactsCount').textContent = '0';
                document.getElementById('pageViews').textContent = '0';
                document.getElementById('mediaCount').textContent = '0';
            }
        } catch (error) {
            console.error('=== LOAD DASHBOARD STATS HATASI ===');
            console.error('Dashboard stats loading error:', error);
            // Fallback değerler
            document.getElementById('servicesCount').textContent = '0';
            document.getElementById('contactsCount').textContent = '0';
            document.getElementById('pageViews').textContent = '0';
            document.getElementById('mediaCount').textContent = '0';
        }
    }

    async loadRecentContacts() {
        try {
            const response = await fetch('/api/admin/contacts/recent', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const contacts = await response.json();
                const container = document.getElementById('recentContacts');
                
                if (contacts.length === 0) {
                    container.innerHTML = '<p>Henüz mesaj yok</p>';
                    return;
                }

                const html = contacts.map(contact => `
                    <div class="contact-item">
                        <div class="contact-header">
                            <span class="contact-name">${contact.name}</span>
                            <span class="contact-date">${new Date(contact.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <span class="contact-service">${contact.service}</span>
                        <p class="contact-message">${contact.message.substring(0, 100)}${contact.message.length > 100 ? '...' : ''}</p>
                    </div>
                `).join('');

                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Recent contacts loading error:', error);
        }
    }

    async loadServices() {
        try {
            console.log('=== LOAD SERVICES BAŞLADI ===');
            const response = await fetch('/api/admin/services', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            console.log('Services response status:', response.status);
            
            if (response.ok) {
                const services = await response.json();
                console.log('Yüklenen hizmetler:', services);
                console.log('Hizmet sayısı:', services ? services.length : 0);
                
                const container = document.getElementById('servicesList');
                
                if (!services || services.length === 0) {
                    container.innerHTML = '<p>Henüz hizmet eklenmemiş</p>';
                    console.log('Hizmet listesi boş');
                    return;
                }

                const html = services.map((service, index) => {
                    const serviceId = service._id || service.id || `unknown_${index}`;
                    console.log(`Hizmet ${index + 1}: ID=${serviceId}, Name=${service.name}, Slug=${service.slug}`);
                    
                    return `
                        <div class="service-item">
                            <h3>${service.name || 'İsimsiz Hizmet'}</h3>
                            <p>${service.description || 'Açıklama yok'}</p>
                            <div class="service-actions">
                                <button class="btn btn-warning btn-sm" data-action="edit-service" data-service-id="${serviceId}">
                                    <i class="fas fa-edit"></i> Düzenle
                                </button>
                                <button class="btn btn-danger btn-sm" data-action="delete-service" data-service-id="${serviceId}">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');

                container.innerHTML = html;
                console.log('Hizmetler başarıyla yüklendi, toplam:', services.length, 'adet');
            } else {
                console.error('Services response not ok:', response.status);
                const container = document.getElementById('servicesList');
                container.innerHTML = `<p>Hizmetler yüklenirken hata oluştu (HTTP ${response.status})</p>`;
            }
        } catch (error) {
            console.error('=== SERVICES LOADING HATASI ===');
            console.error('Services loading error:', error);
            const container = document.getElementById('servicesList');
            container.innerHTML = `<p>Hizmetler yüklenirken hata oluştu: ${error.message}</p>`;
        }
    }

    async loadMedia() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.displayCurrentMedia(data.data);
                }
            }
        } catch (error) {
            console.error('Media yükleme hatası:', error);
        }
    }

    displayCurrentMedia(settings) {
        const mediaGrid = document.getElementById('current-media-grid');
        if (!mediaGrid) return;

        const mediaItems = [
            { key: 'navbar_logo', title: 'Navbar Logo', description: 'Üst menüde görünen logo' },
            { key: 'homepage_hero_bg', title: 'Anasayfa Arkaplanı', description: 'Ana sayfa hero bölümü arka planı' },
            { key: 'service_mobilvinchizmeti_img', title: 'Mobil Vinç Hizmeti', description: 'Mobil vinç hizmet sayfası görseli' },
            { key: 'service_insaatkurulumu_img', title: 'İnşaat Kurulum Hizmeti', description: 'İnşaat kurulum hizmet sayfası görseli' },
            { key: 'service_petrolkuyuhizmeti_img', title: 'Petrol Kuyusu Hizmeti', description: 'Petrol kuyusu hizmet sayfası görseli' },
            { key: 'service_petrolinsaatsahasi_img', title: 'Petrol ve İnşaat Sahası', description: 'Petrol ve inşaat sahası hizmet sayfası görseli' }
        ];

        let html = '';
        mediaItems.forEach(item => {
            const imageUrl = settings[item.key];
            const hasImage = imageUrl && imageUrl.trim() !== '';
            
            html += `
                <div class="media-item" data-media-key="${item.key}">
                    <div class="media-item-header">
                        <div>
                            <div class="media-item-title">${item.title}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.description}</div>
                        </div>
                        <div class="media-item-actions">
                            <button class="btn-change" data-action="change" data-key="${item.key}">Değiştir</button>
                            ${hasImage ? `<button class="btn-remove" data-action="remove" data-key="${item.key}">Kaldır</button>` : ''}
                        </div>
                    </div>
                    <div class="media-item-preview">
                        ${hasImage ? 
                            `<img src="${imageUrl}" alt="${item.title}" onerror="this.parentElement.innerHTML='<div class=\\'no-image\\'>Görsel yüklenemedi</div>'">` :
                            `<div class="no-image">Görsel yok</div>`
                        }
                    </div>
                    ${hasImage ? `<div class="media-item-url">${imageUrl}</div>` : ''}
                </div>
            `;
        });

        mediaGrid.innerHTML = html;
        
        // Event listener'ları ekle
        this.setupMediaEventListeners();
    }

    setupMediaEventListeners() {
        const mediaGrid = document.getElementById('current-media-grid');
        if (!mediaGrid) return;

        // Değiştir butonları için event listener
        mediaGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-change')) {
                const key = e.target.getAttribute('data-key');
                this.changeMedia(key);
            } else if (e.target.classList.contains('btn-remove')) {
                const key = e.target.getAttribute('data-key');
                this.removeMedia(key);
            }
        });
    }

    changeMedia(key) {
        // Dropdown'u seç ve dosya seçiciyi aç
        const targetSelect = document.getElementById('media-target');
        const fileInput = document.getElementById('media-file');
        
        targetSelect.value = key;
        fileInput.click();
    }

    async removeMedia(key) {
        if (!confirm('Bu görseli kaldırmak istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/media/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ targetField: key })
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('Görsel başarıyla kaldırıldı', 'success');
                this.loadMedia(); // Listeyi yenile
            } else {
                this.showMessage(data.message || 'Görsel kaldırılamadı', 'error');
            }
        } catch (error) {
            console.error('Görsel kaldırma hatası:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    async loadContacts() {
        try {
            const response = await fetch('/api/admin/contacts', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const contacts = await response.json();
                const container = document.getElementById('contactsList');
                
                if (contacts.length === 0) {
                    container.innerHTML = '<p>Henüz mesaj yok</p>';
                    return;
                }

                const html = contacts.map(contact => `
                    <div class="contact-item">
                        <div class="contact-header">
                            <span class="contact-name">${contact.name}</span>
                            <span class="contact-date">${new Date(contact.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <span class="contact-service">${contact.service}</span>
                        <p class="contact-message">${contact.message}</p>
                    </div>
                `).join('');

                container.innerHTML = html;
            }
        } catch (error) {
            console.error('Contacts loading error:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.populateSettingsForm(data.data);
                }
            }
        } catch (error) {
            console.error('Settings loading error:', error);
        }
    }

    populateSettingsForm(settings) {
        // Form alanlarını doldur
        const formFields = {
            'siteTitle': settings.site_title || 'Bismil Vinç',
            'siteDescription': settings.site_description || '',
            'phoneNumber': settings.phone_number || '0555 123 45 67',
            'whatsappNumber': settings.whatsapp_number || '0555 123 45 67',
            'emailAddress': settings.email_address || 'info@bismilvinc.com',
            'address': settings.address || 'Bismil, Diyarbakır',
            'workingHours': settings.working_hours || '7/24 Hizmet',
            'mapLatitude': settings.map_latitude || '37.842249',
            'mapLongitude': settings.map_longitude || '40.669449'
        };

        // Her alanı doldur
        Object.keys(formFields).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = formFields[fieldId];
            }
        });
    }

    async handleSettingsSubmit() {
        const formData = {
            site_title: document.getElementById('siteTitle').value,
            site_description: document.getElementById('siteDescription').value,
            phone_number: document.getElementById('phoneNumber').value,
            whatsapp_number: document.getElementById('whatsappNumber').value,
            email_address: document.getElementById('emailAddress').value,
            address: document.getElementById('address').value,
            working_hours: document.getElementById('workingHours').value,
            map_latitude: document.getElementById('mapLatitude').value,
            map_longitude: document.getElementById('mapLongitude').value
        };

        try {
            const response = await fetch('/api/admin/settings/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                this.showMessage('Ayarlar başarıyla kaydedildi', 'success');
                // Ayarları yeniden yükle
                await this.loadSettings();
            } else {
                this.showMessage(data.message || 'Ayarlar kaydedilemedi', 'error');
            }
        } catch (error) {
            console.error('Settings update error:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    // Service Management
    openServiceModal(serviceId = null) {
        const modal = document.getElementById('serviceModal');
        const title = document.getElementById('serviceModalTitle');
        const form = document.getElementById('serviceForm');

        if (serviceId) {
            title.innerHTML = '<i class="fas fa-edit"></i> Hizmet Düzenle';
            this.loadServiceData(serviceId);
        } else {
            title.innerHTML = '<i class="fas fa-plus"></i> Yeni Hizmet Ekle';
            form.reset();
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // İlk input'a focus
        setTimeout(() => {
            const firstInput = form.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }

    closeServiceModal() {
        const modal = document.getElementById('serviceModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    async handleServiceSubmit() {
        const form = document.getElementById('serviceForm');
        const serviceId = form.getAttribute('data-service-id');
        const formData = new FormData(form);
        
        // Görsel dosyasını kontrol et
        const imageFile = formData.get('image');
        
        const serviceData = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description'),
            icon: formData.get('icon')
        };

        try {
            // Eğer görsel seçilmişse, önce Cloudinary'ye yükle
            if (imageFile && imageFile.size > 0) {
                console.log('Görsel yükleniyor...', imageFile.name);
                
                // Görseli base64'e çevir
                const base64Data = await this.fileToBase64(imageFile);
                
                // Cloudinary'ye yükle
                const uploadResponse = await fetch('/api/admin/media/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        base64Data: base64Data,
                        fileName: imageFile.name,
                        targetField: `service_${serviceData.slug}_img`
                    })
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    if (uploadResult.success) {
                        console.log('Görsel başarıyla yüklendi:', uploadResult.url);
                        // Görsel URL'sini service data'ya ekle
                        serviceData.imageUrl = uploadResult.url;
                    } else {
                        this.showMessage('Görsel yüklenemedi: ' + uploadResult.message, 'error');
                        return;
                    }
                } else {
                    this.showMessage('Görsel yükleme hatası', 'error');
                    return;
                }
            }

            const url = serviceId ? `/api/admin/services/${serviceId}` : '/api/admin/services';
            const method = serviceId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(serviceData)
            });

            if (response.ok) {
                this.showMessage(serviceId ? 'Hizmet başarıyla güncellendi!' : 'Hizmet başarıyla kaydedildi!', 'success');
                this.closeServiceModal();
                this.loadServices();
                // Form'dan service ID'sini temizle
                form.removeAttribute('data-service-id');
                // Form'u temizle
                form.reset();
            } else {
                const error = await response.json();
                this.showMessage(error.message, 'error');
            }
        } catch (error) {
            console.error('Service submit error:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    async deleteService(serviceId) {
        if (!confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showMessage('Hizmet başarıyla silindi!', 'success');
                this.loadServices();
            } else {
                this.showMessage('Hizmet silinemedi', 'error');
            }
        } catch (error) {
            console.error('Service delete error:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    editService(serviceId) {
        this.openServiceModal(serviceId);
    }

    async loadServiceData(serviceId) {
        try {
            const response = await fetch(`/api/admin/services/${serviceId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const service = await response.json();
                const form = document.getElementById('serviceForm');
                
                form.querySelector('[name="name"]').value = service.name || '';
                form.querySelector('[name="slug"]').value = service.slug || '';
                form.querySelector('[name="description"]').value = service.description || '';
                form.querySelector('[name="icon"]').value = service.icon || '';
                
                // Form'a service ID'sini ekle
                form.setAttribute('data-service-id', serviceId);
            }
        } catch (error) {
            console.error('Service data loading error:', error);
            this.showMessage('Hizmet bilgileri yüklenemedi', 'error');
        }
    }

    // Theme Management
    async handleThemeSubmit() {
        const formData = new FormData(document.getElementById('themeForm'));
        const themeData = {
            primaryColor: formData.get('primaryColor'),
            primaryDark: formData.get('primaryDark'),
            backgroundColor: formData.get('backgroundColor'),
            fontFamily: formData.get('fontFamily')
        };

        try {
            const response = await fetch('/api/admin/theme', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(themeData)
            });

            if (response.ok) {
                this.showMessage('Tema başarıyla kaydedildi!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.message, 'error');
            }
        } catch (error) {
            console.error('Theme submit error:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    // Media Management
    openMediaUpload() {
        const modal = document.getElementById('mediaUploadModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeMediaUpload() {
        const modal = document.getElementById('mediaUploadModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    async handleMediaUpload() {
        const mediaTargetSelect = document.getElementById('media-target');
        const mediaFileInput = document.getElementById('media-file');
        const mediaPreview = document.getElementById('media-upload-preview');
        const mediaMessage = document.getElementById('media-upload-message');
        
        // Form verilerini temizle
        mediaMessage.textContent = '';
        mediaPreview.innerHTML = '';
        
        const file = mediaFileInput.files[0];
        const targetField = mediaTargetSelect.value;
        
        if (!file || !targetField) {
            mediaMessage.textContent = 'Lütfen bir görsel ve alan seçin.';
            mediaMessage.className = 'message error';
            return;
        }
        
        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
            mediaMessage.textContent = 'Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.';
            mediaMessage.className = 'message error';
            return;
        }
        
        // Dosya tipi kontrolü
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            mediaMessage.textContent = 'Sadece JPEG, PNG ve GIF dosyaları kabul edilir.';
            mediaMessage.className = 'message error';
            return;
        }
        
        // Görseli base64'e çevir
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Data = event.target.result; // Tam data URL'yi gönder
            mediaMessage.textContent = 'Yükleniyor...';
            mediaMessage.className = 'message info';
            
            try {
                console.log('=== FRONTEND MEDIA UPLOAD BAŞLADI ===');
                console.log('Target field:', targetField);
                console.log('File name:', file.name);
                console.log('File size:', file.size);
                console.log('File type:', file.type);
                
                const response = await fetch('/api/admin/media/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify({
                        base64Data,
                        fileName: file.name,
                        targetField
                    })
                });
                
                console.log('Response status:', response.status);
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok && data.success && data.url) {
                    mediaMessage.textContent = data.message || 'Görsel başarıyla yüklendi!';
                    mediaMessage.className = 'message success';
                    mediaPreview.innerHTML = `<img src="${data.url}" alt="Yüklenen görsel" style="max-width:300px;max-height:200px;">`;
                    
                    // Formu temizle
                    mediaFileInput.value = '';
                    mediaTargetSelect.value = '';
                    
                    // Mevcut görselleri yenile
                    this.loadMedia();
                } else {
                    console.error('Upload failed:', data);
                    let errorMessage = data.message || 'Yükleme başarısız.';
                    
                    // Daha detaylı hata mesajları
                    if (data.error) {
                        if (data.error.includes('Cloudinary')) {
                            if (data.error.includes('environment variables')) {
                                errorMessage = '❌ Cloudinary ayarları eksik! Lütfen Vercel\'de CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET değişkenlerini ayarlayın.';
                            } else if (data.error.includes('Invalid API key')) {
                                errorMessage = '❌ Geçersiz Cloudinary API anahtarı! Lütfen Vercel\'de CLOUDINARY_API_KEY değişkenini kontrol edin.';
                            } else if (data.error.includes('Invalid signature')) {
                                errorMessage = '❌ Geçersiz Cloudinary imzası! Lütfen Vercel\'de CLOUDINARY_API_SECRET değişkenini kontrol edin.';
                            } else {
                                errorMessage = '❌ Cloudinary hatası: ' + data.error;
                            }
                        } else if (data.error.includes('Supabase')) {
                            errorMessage = '⚠️ Veritabanı hatası: ' + data.error;
                        } else if (data.error.includes('environment variables')) {
                            errorMessage = '❌ ' + data.error;
                        } else {
                            errorMessage = '❌ ' + data.error;
                        }
                    }
                    
                    mediaMessage.textContent = errorMessage;
                    mediaMessage.className = 'message error';
                }
            } catch (error) {
                console.error('=== FRONTEND MEDIA UPLOAD HATASI ===');
                console.error('Media upload error:', error);
                mediaMessage.textContent = 'Bağlantı hatası: ' + error.message;
                mediaMessage.className = 'message error';
            }
        };
        
        reader.onerror = (error) => {
            console.error('File read error:', error);
            mediaMessage.textContent = 'Dosya okuma hatası.';
            mediaMessage.className = 'message error';
        };
        
        reader.readAsDataURL(file);
    }

    // Utility Functions
    generateSlug(text) {
        const slug = text
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        document.getElementById('serviceSlug').value = slug;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // File to Base64 conversion
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data:image/jpeg;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    editPage(pageType) {
        // Sayfa düzenleme modal'ını aç
        this.openPageEditModal(pageType);
    }

    openPageEditModal(pageType) {
        const modal = document.getElementById('pageEditModal');
        const title = document.getElementById('pageEditModalTitle');
        const form = document.getElementById('pageEditForm');
        
        // Sayfa tipine göre başlık ve form alanlarını ayarla
        const pageConfig = {
            home: {
                title: 'Ana Sayfa İçerikleri',
                icon: 'fas fa-home',
                fields: [
                    { name: 'hero_title', label: 'Ana Başlık', type: 'text', value: 'Profesyonel Vinç Kurulum Hizmeti', placeholder: 'Ana sayfa başlığını girin' },
                    { name: 'hero_subtitle', label: 'Alt Başlık', type: 'textarea', value: 'Diyarbakır\'da güvenilir ve kaliteli mobil vinç, platform lift ve inşaat kurulum hizmetleri sunuyoruz.', placeholder: 'Ana sayfa alt başlığını girin' },
                    { name: 'services_intro', label: 'Hizmetler Giriş Metni', type: 'textarea', value: 'Bismil Vinç olarak, Diyarbakır ve çevre illerde profesyonel vinç ve kurulum hizmetleri sunuyoruz. Modern ekipmanlarımız ve uzman ekibimizle, her türlü projenizi güvenle tamamlıyoruz.', placeholder: 'Hizmetler bölümü giriş metnini girin' }
                ]
            },
            about: {
                title: 'Hakkımızda İçerikleri',
                icon: 'fas fa-info-circle',
                fields: [
                    { name: 'about_title', label: 'Başlık', type: 'text', value: 'Hakkımızda', placeholder: 'Hakkımızda başlığını girin' },
                    { name: 'about_text1', label: 'Birinci Paragraf', type: 'textarea', value: 'Bismil Vinç olarak, Diyarbakır ve çevre illerde 16 yılı aşkın deneyimimizle mobil vinç ve kaldırma hizmetleri sunuyoruz. Müşterilerimizin güvenliği ve memnuniyeti bizim için en önemli önceliktir.', placeholder: 'İlk paragraf metnini girin' },
                    { name: 'about_text2', label: 'İkinci Paragraf', type: 'textarea', value: 'Modern ekipmanlarımız ve uzman ekibimizle, her türlü kaldırma işlemini en yüksek güvenlik standartlarında gerçekleştiriyoruz. İnşaat, endüstri ve özel projelerinizde güvenilir çözüm ortağınız olmaktan gurur duyuyoruz.', placeholder: 'İkinci paragraf metnini girin' },
                    { name: 'experience_years', label: 'Deneyim Yılı', type: 'number', value: '16', placeholder: 'Deneyim yılını girin' },
                    { name: 'completed_projects', label: 'Tamamlanan Proje', type: 'number', value: '500', placeholder: 'Tamamlanan proje sayısını girin' },
                    { name: 'safety_record', label: 'Güvenlik Kaydı', type: 'text', value: '%100', placeholder: 'Güvenlik kaydını girin' }
                ]
            },
            contact: {
                title: 'İletişim İçerikleri',
                icon: 'fas fa-address-book',
                fields: [
                    { name: 'contact_title', label: 'Başlık', type: 'text', value: 'İletişim', placeholder: 'İletişim başlığını girin' },
                    { name: 'contact_subtitle', label: 'Alt Başlık', type: 'text', value: 'Bizimle iletişime geçin', placeholder: 'İletişim alt başlığını girin' },
                    { name: 'contact_form_title', label: 'Form Başlığı', type: 'text', value: 'Mesaj Gönderin', placeholder: 'Form başlığını girin' }
                ]
            }
        };

        const config = pageConfig[pageType];
        if (!config) {
            this.showMessage('Geçersiz sayfa tipi', 'error');
            return;
        }

        // Başlığı güncelle
        title.innerHTML = `<i class="${config.icon}"></i> ${config.title}`;
        
        // Form alanlarını oluştur
        let formHTML = '';
        config.fields.forEach(field => {
            if (field.type === 'textarea') {
                formHTML += `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <textarea id="${field.name}" name="${field.name}" rows="4" placeholder="${field.placeholder}" required>${field.value}</textarea>
                    </div>
                `;
            } else {
                formHTML += `
                    <div class="form-group">
                        <label for="${field.name}">${field.label}</label>
                        <input type="${field.type}" id="${field.name}" name="${field.name}" value="${field.value}" placeholder="${field.placeholder}" required>
                    </div>
                `;
            }
        });

        form.innerHTML = formHTML;
        form.setAttribute('data-page-type', pageType);
        
        // Modal'ı aç
        modal.style.display = 'flex';
        
        // Body scroll'u engelle
        document.body.style.overflow = 'hidden';
        
        // İlk input'a focus
        setTimeout(() => {
            const firstInput = form.querySelector('input, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }

    closePageEditModal() {
        const modal = document.getElementById('pageEditModal');
        modal.style.display = 'none';
        
        // Body scroll'u geri aç
        document.body.style.overflow = '';
    }

    async handlePageEditSubmit() {
        const form = document.getElementById('pageEditForm');
        const pageType = form.getAttribute('data-page-type');
        const formData = new FormData(form);
        
        const pageData = {};
        for (const [key, value] of formData.entries()) {
            pageData[key] = value;
        }

        try {
            const response = await fetch('/api/admin/pages/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    pageType,
                    data: pageData
                })
            });

            const result = await response.json();
            if (result.success) {
                this.showMessage('Sayfa içerikleri başarıyla güncellendi', 'success');
                this.closePageEditModal();
            } else {
                this.showMessage(result.message || 'Güncelleme başarısız', 'error');
            }
        } catch (error) {
            console.error('Page edit error:', error);
            this.showMessage('Bir hata oluştu', 'error');
        }
    }

    handleMediaFileSelect(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('media-upload-preview');
        const message = document.getElementById('media-upload-message');
        
        if (!file) {
            preview.innerHTML = '';
            message.innerHTML = '';
            return;
        }

        // Dosya türü kontrolü
        if (!file.type.startsWith('image/')) {
            message.innerHTML = '<div class="message error">Lütfen geçerli bir görsel dosyası seçin.</div>';
            preview.innerHTML = '';
            return;
        }

        // Dosya boyutu kontrolü (5MB)
        if (file.size > 5 * 1024 * 1024) {
            message.innerHTML = '<div class="message error">Dosya boyutu 5MB\'dan küçük olmalıdır.</div>';
            preview.innerHTML = '';
            return;
        }

        // Preview göster
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
            message.innerHTML = '<div class="message info">Dosya seçildi. Yüklemek için "Yükle" butonuna tıklayın.</div>';
        };
        reader.readAsDataURL(file);
    }

    async loadFooterData() {
        try {
            console.log('Footer verileri yükleniyor...');
            const response = await fetch('/api/admin/footer', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            console.log('Footer API response:', response);
            
            const result = await response.json();
            console.log('Footer API result:', result);
            
            if (result.success) {
                console.log('Footer verileri başarıyla yüklendi:', result.data);
                this.populateFooterForm(result.data);
                this.updateFooterPreview(result.data);
            } else {
                console.error('Footer verileri yüklenemedi:', result.message);
            }
        } catch (error) {
            console.error('Footer verileri yükleme hatası:', error);
        }
    }

    populateFooterForm(footerData) {
        console.log('populateFooterForm çağrıldı, footerData:', footerData);
        
        const form = document.getElementById('footerForm');
        console.log('Footer form bulundu:', form);
        
        if (!form) {
            console.error('Footer form bulunamadı!');
            return;
        }

        // Form alanlarını doldur
        Object.keys(footerData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            console.log(`Aranan input: [name="${key}"]`, input);
            
            if (input) {
                input.value = footerData[key] || '';
                console.log(`${key} alanı dolduruldu: ${footerData[key]}`);
            } else {
                console.warn(`${key} için input bulunamadı`);
            }
        });
    }

    updateFooterPreview(footerData) {
        const previewContent = document.querySelector('.footer-preview-content');
        if (!previewContent) return;

        const preview = `
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <h4>${footerData.footer_company_name || 'Bismil Vinç'}</h4>
                    <p>${footerData.footer_description || 'Şirket açıklaması'}</p>
                    <p><strong>İletişim:</strong></p>
                    <p class="phone-number">📞 ${footerData.footer_phone || 'Telefon'}</p>
                    ${footerData.footer_phone2 ? `<p class="phone-number">📞 ${footerData.footer_phone2}</p>` : ''}
                    ${footerData.footer_whatsapp ? `<p class="phone-number">📱 ${footerData.footer_whatsapp}</p>` : ''}
                    ${footerData.footer_email ? `<p>📧 ${footerData.footer_email}</p>` : ''}
                    <p>📍 ${footerData.footer_address || 'Adres'}</p>
                    <p>⏰ ${footerData.footer_working_hours || 'Çalışma saatleri'}</p>
                </div>
                <div>
                    <h4>Hızlı Linkler</h4>
                    <a href="#">${footerData.footer_home_link || 'Ana Sayfa'}</a>
                    <a href="#">${footerData.footer_services_link || 'Hizmetler'}</a>
                    <a href="#">${footerData.footer_about_link || 'Hakkımızda'}</a>
                    <a href="#">${footerData.footer_contact_link || 'İletişim'}</a>
                </div>
                <div>
                    <h4>Hizmetlerimiz</h4>
                    <a href="#">${footerData.footer_service1 || 'Hizmet 1'}</a>
                    <a href="#">${footerData.footer_service2 || 'Hizmet 2'}</a>
                    <a href="#">${footerData.footer_service3 || 'Hizmet 3'}</a>
                    <a href="#">${footerData.footer_service4 || 'Hizmet 4'}</a>
                    <a href="#">${footerData.footer_service5 || 'Hizmet 5'}</a>
                </div>
            </div>
            <div class="copyright">
                ${footerData.footer_copyright || '© 2024 Bismil Vinç. Tüm hakları saklıdır.'}
            </div>
        `;

        previewContent.innerHTML = preview;
    }

    async handleFooterSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const footerData = {};
        
        // Form verilerini topla
        for (let [key, value] of formData.entries()) {
            footerData[key] = value;
        }
        
        try {
            const response = await fetch('/api/admin/footer/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(footerData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Footer başarıyla güncellendi!', 'success');
                this.updateFooterPreview(footerData);
            } else {
                this.showMessage('Footer güncellenirken hata oluştu: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Footer güncelleme hatası:', error);
            this.showMessage('Footer güncellenirken hata oluştu', 'error');
        }
    }

    // Navbar yönetimi
    loadNavbarData() {
        fetch('/api/admin/settings', {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            this.populateNavbarForm(data);
            this.updateNavbarPreview(data);
        })
        .catch(error => {
            console.error('Navbar verileri yüklenirken hata:', error);
        });
    }

    populateNavbarForm(data) {
        const form = document.getElementById('navbarForm');
        if (!form) return;

        // Form alanlarını doldur
        const companyName = form.querySelector('[name="navbar_company_name"]');
        if (companyName) companyName.value = data.navbar_company_name || 'Bismil Vinç';

        const homeLink = form.querySelector('[name="navbar_home_link"]');
        if (homeLink) homeLink.value = data.navbar_home_link || 'Ana Sayfa';

        const servicesLink = form.querySelector('[name="navbar_services_link"]');
        if (servicesLink) servicesLink.value = data.navbar_services_link || 'Hizmetler';

        const aboutLink = form.querySelector('[name="navbar_about_link"]');
        if (aboutLink) aboutLink.value = data.navbar_about_link || 'Hakkımızda';

        const contactLink = form.querySelector('[name="navbar_contact_link"]');
        if (contactLink) contactLink.value = data.navbar_contact_link || 'İletişim';
    }

    updateNavbarPreview(data) {
        // Logo
        const previewLogo = document.getElementById('preview-logo');
        if (previewLogo && data.navbar_logo) {
            previewLogo.src = data.navbar_logo;
            previewLogo.style.display = 'block';
        }

        // Şirket adı
        const previewCompanyName = document.getElementById('preview-company-name');
        if (previewCompanyName) {
            previewCompanyName.textContent = data.navbar_company_name || 'Bismil Vinç';
        }

        // Menü linkleri
        const previewHomeLink = document.getElementById('preview-home-link');
        if (previewHomeLink) {
            previewHomeLink.textContent = data.navbar_home_link || 'Ana Sayfa';
        }

        const previewServicesLink = document.getElementById('preview-services-link');
        if (previewServicesLink) {
            previewServicesLink.textContent = data.navbar_services_link || 'Hizmetler';
        }

        const previewAboutLink = document.getElementById('preview-about-link');
        if (previewAboutLink) {
            previewAboutLink.textContent = data.navbar_about_link || 'Hakkımızda';
        }

        const previewContactLink = document.getElementById('preview-contact-link');
        if (previewContactLink) {
            previewContactLink.textContent = data.navbar_contact_link || 'İletişim';
        }
    }

    handleNavbarSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const navbarData = {};

        // Form verilerini topla
        for (const [key, value] of formData.entries()) {
            navbarData[key] = value;
        }

        // API'ye gönder
        fetch('/api/admin/settings/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
            body: JSON.stringify(navbarData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showMessage('Navbar ayarları başarıyla güncellendi!', 'success');
                this.updateNavbarPreview(navbarData);
            } else {
                this.showMessage('Navbar ayarları güncellenirken hata oluştu!', 'error');
            }
        })
        .catch(error => {
            console.error('Navbar güncelleme hatası:', error);
            this.showMessage('Navbar ayarları güncellenirken hata oluştu!', 'error');
        });
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel(); 
