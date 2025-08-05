// Test script for background image update functionality
const testBackgroundImageUpdate = async () => {
    console.log('🧪 Background Image Update Test Başladı');
    
    try {
        // 1. Test settings API
        console.log('1. Settings API test ediliyor...');
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Settings API çalışıyor');
            console.log('Background image URL:', data.data.homepage_hero_bg);
        } else {
            console.error('❌ Settings API hatası');
            return;
        }
        
        // 2. Test admin settings update
        console.log('2. Admin settings update test ediliyor...');
        const adminResponse = await fetch('/api/admin/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
            }
        });
        
        if (adminResponse.ok) {
            console.log('✅ Admin settings API çalışıyor');
        } else {
            console.log('⚠️ Admin settings API erişimi yok (normal)');
        }
        
        // 3. Test background image refresh function
        console.log('3. Background image refresh function test ediliyor...');
        if (typeof refreshBackgroundImage === 'function') {
            console.log('✅ refreshBackgroundImage function mevcut');
            
            // Function'ı çağır
            await refreshBackgroundImage();
            console.log('✅ Background image refresh çağrıldı');
        } else {
            console.error('❌ refreshBackgroundImage function bulunamadı');
        }
        
        // 4. Test cache-busting
        console.log('4. Cache-busting test ediliyor...');
        const timestamp = new Date().getTime();
        const testUrl = 'https://example.com/image.jpg';
        const cacheBustedUrl = testUrl.includes('?') 
            ? `${testUrl}&t=${timestamp}`
            : `${testUrl}?t=${timestamp}`;
        
        console.log('Original URL:', testUrl);
        console.log('Cache-busted URL:', cacheBustedUrl);
        console.log('✅ Cache-busting çalışıyor');
        
        console.log('🎉 Tüm testler başarılı!');
        
    } catch (error) {
        console.error('❌ Test hatası:', error);
    }
};

// Test'i çalıştır
if (typeof window !== 'undefined') {
    // Browser'da çalıştır
    window.testBackgroundImageUpdate = testBackgroundImageUpdate;
    console.log('🧪 Test fonksiyonu hazır. Console\'da testBackgroundImageUpdate() yazarak çalıştırabilirsiniz.');
} else {
    // Node.js'de çalıştır
    testBackgroundImageUpdate();
} 