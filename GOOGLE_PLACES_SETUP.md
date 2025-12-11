# Google Places API Kurulumu

## 🗺️ Gerçek Mekan Entegrasyonu

VibeR artık Google Places API ile gerçek mekanları kullanarak size özel rotalar oluşturuyor!

## 📝 API Key Alma Adımları

### 1. Google Cloud Console'a Giriş Yapın
- [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
- Google hesabınızla giriş yapın

### 2. Yeni Proje Oluşturun (veya mevcut projeyi seçin)
- Sol üst köşeden proje seçiciye tıklayın
- "New Project" (Yeni Proje) butonuna tıklayın
- Proje adı girin (örn: "VibeR App")
- "Create" (Oluştur) butonuna tıklayın

### 3. Places API'yi Etkinleştirin
- Sol menüden "APIs & Services" > "Library" seçin
- "Places API" araması yapın
- "Places API"ye tıklayın
- "Enable" (Etkinleştir) butonuna tıklayın

### 4. API Key Oluşturun
- Sol menüden "APIs & Services" > "Credentials" seçin
- "+ CREATE CREDENTIALS" butonuna tıklayın
- "API Key" seçeneğini seçin
- API key'iniz oluşturulacak

### 5. API Key'i Kısıtlayın (Güvenlik için önemli!)
- Oluşturulan API key'in yanındaki edit (kalem) simgesine tıklayın
- "Application restrictions" bölümünde:
  - iOS için: "iOS apps" seçin ve bundle ID ekleyin (`com.viber.app`)
  - Android için: "Android apps" seçin ve package name ve SHA-1 ekleyin
- "API restrictions" bölümünde:
  - "Restrict key" seçin
  - "Places API" seçin
- "Save" (Kaydet) butonuna tıklayın

### 6. API Key'i Projeye Ekleyin

Proje kök dizininde `.env` dosyası oluşturun:

```bash
# .env.example dosyasını kopyalayın
cp .env.example .env
```

`.env` dosyasına API key'inizi ekleyin:

```env
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 💰 Fiyatlandırma

Google Places API ücretsiz kotası:
- **İlk $200 krediniz ücretsiz** (her ay)
- Places Nearby Search: $32 / 1000 istek
- Place Details: $17 / 1000 istek
- Place Photos: $7 / 1000 istek

**Not:** Küçük ölçekli kullanım için ücretsiz kota genellikle yeterlidir!

## 🔧 API Olmadan Kullanım

API key eklemeden de uygulama çalışır! Bu durumda:
- ✅ OpenStreetMap (Overpass API) ücretsiz olarak kullanılır
- ⚠️ Rota oluşturmada örnek veriler gösterilir
- 💡 Temel işlevsellik etkilenmez

## 🧪 Test Etme

1. Projeyi yeniden başlatın:
```bash
npm start
```

2. "Rota Oluştur" ekranına gidin
3. Aktivite türlerini seçin
4. "Rota Oluştur" butonuna tıklayın
5. Eğer API key doğruysa "✅ Gerçek Mekanlar" rozeti görünecektir

## ⚠️ Sorun Giderme

### "Gerçek Mekanlar" rozeti görünmüyor
- `.env` dosyasının doğru yerde olduğundan emin olun
- API key'in doğru olduğunu kontrol edin
- Uygulamayı tamamen kapatıp yeniden başlatın (`npx expo start --clear`)

### "API error" mesajı alıyorum
- Google Cloud Console'da Places API'nin etkinleştirildiğini kontrol edin
- API key kısıtlamalarını kontrol edin
- Billing hesabının aktif olduğundan emin olun

### Konum izni verilmiyor
- iOS: Settings > Privacy > Location Services > Expo Go
- Android: Settings > Apps > Expo Go > Permissions > Location

## 📚 Kaynaklar

- [Google Places API Dokümantasyonu](https://developers.google.com/maps/documentation/places/web-service)
- [Fiyatlandırma Hesaplayıcı](https://mapsplatformtransition.withgoogle.com/calculator)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

**🎉 Hazırsınız!** Artık uygulamanız gerçek mekanlarla kişiselleştirilmiş rotalar oluşturacak!
