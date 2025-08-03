const fs = require('fs');
const path = require('path');

console.log('🔧 Bismil Vinç - Environment Variables Setup');
console.log('============================================\n');

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env dosyası zaten mevcut!');
    console.log('Mevcut .env dosyasını yedeklemek ister misiniz? (y/n)');
    process.stdin.once('data', (data) => {
        const answer = data.toString().trim().toLowerCase();
        if (answer === 'y' || answer === 'yes') {
            const backupPath = path.join(__dirname, '.env.backup');
            fs.copyFileSync(envPath, backupPath);
            console.log('✅ .env dosyası .env.backup olarak yedeklendi');
        }
        createEnvFile();
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    const templatePath = path.join(__dirname, 'env-template.txt');
    
    if (!fs.existsSync(templatePath)) {
        console.error('❌ env-template.txt dosyası bulunamadı!');
        process.exit(1);
    }
    
    try {
        fs.copyFileSync(templatePath, envPath);
        console.log('✅ .env dosyası oluşturuldu!');
        console.log('\n📝 Şimdi .env dosyasını düzenleyin ve gerçek değerlerinizi girin:');
        console.log('   - Supabase URL ve API Key');
        console.log('   - Cloudinary bilgileri');
        console.log('   - JWT Secret');
        console.log('\n💡 Tüm değerleri girdikten sonra sunucuyu yeniden başlatın.');
        console.log('\n🚀 Sunucuyu başlatmak için: npm start');
    } catch (error) {
        console.error('❌ .env dosyası oluşturulurken hata:', error.message);
        process.exit(1);
    }
} 