# VibeR - Expo Go İle Çalıştırma Kılavuzu

## 🎉 Projeniz Expo Go için hazır!

React Native projeniz başarıyla Expo Go ile çalışacak şekilde dönüştürüldü. Artık QR kod ile telefonunuzdan uygulamanızı test edebilirsiniz!

## 📱 Expo Go ile Nasıl Çalıştırılır?

### 1. Expo Go Uygulamasını İndirin

- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Projeyi Başlatın

Terminal'de proje dizininde şu komutu çalıştırın:

```bash
npm start
# veya
npx expo start
```

### 3. QR Kodu Okutun

- **Android:** Expo Go uygulamasını açın ve "Scan QR Code" butonuna tıklayın
- **iOS:** Cihazınızın kamera uygulamasını açın ve QR kodu okutun

### 4. Uygulamanız Yüklenecek!

Expo Go uygulaması otomatik olarak projenizi indirecek ve çalıştıracaktır.

## 🚀 Alternatif Çalıştırma Komutları

```bash
# Android emülatörde çalıştır
npm run android

# iOS simülatörde çalıştır (sadece Mac)
npm run ios

# Web tarayıcıda çalıştır
npm run web
```

## 🔧 Yapılan Değişiklikler

### 1. Paket Yöneticisi Güncellemeleri
- ✅ Expo SDK 54 kuruldu
- ✅ React Native 0.81.5'e güncellendi
- ✅ React 19.1.0'a güncellendi
- ✅ Tüm native modüller Expo uyumlu versiyonlara değiştirildi

### 2. Konfigürasyon Dosyaları
- ✅ `app.json` → Expo formatına dönüştürüldü
- ✅ `babel.config.js` → Expo preset eklendi
- ✅ `metro.config.js` → Expo Metro config kullanımı
- ✅ `tsconfig.json` → Expo TypeScript config

### 3. Uygulama Girişi
- ✅ `App.tsx` → AppNavigator ile entegre edildi
- ✅ `index.js` → Expo'nun `registerRootComponent` kullanımı

### 4. Native Modül Değişiklikleri
| Eski Modül | Yeni Modül (Expo) |
|------------|-------------------|
| `@react-native-community/geolocation` | `expo-location` |
| `react-native-image-picker` | `expo-image-picker` |
| `react-native-contacts` | `expo-contacts` |
| `react-native-share` | `expo-sharing` |

### 5. Eklenen Servisler
- ✅ `OverpassService.js` → OpenStreetMap entegrasyonu için oluşturuldu

## ⚠️ Önemli Notlar

### Konum İzinleri
Uygulamanız konum servisleri kullanıyor. İlk açılışta kullanıcıdan izin isteyecektir.

### .env Dosyası
Foursquare API kullanmak için `.env` dosyası oluşturup aşağıdaki gibi düzenleyin:

```env
FOURSQUARE_API_KEY=your_api_key_here
```

### Watchman Uyarısı
Eğer "Recrawled this watch" uyarısı alırsanız şu komutu çalıştırın:

```bash
watchman watch-del '/Users/dilek/Downloads/VibeR'
watchman watch-project '/Users/dilek/Downloads/VibeR'
```

## 🐛 Sorun Giderme

### Uygulama açılmıyor
```bash
# Cache'i temizle ve tekrar başlat
npx expo start -c
```

### Paket hataları
```bash
# Node modules'ü temizle ve tekrar yükle
rm -rf node_modules package-lock.json
npm install
```

### Metro bundler hatası
```bash
# Metro cache'i temizle
npx expo start --clear
```

## 📚 Faydalı Linkler

- [Expo Go Dokümantasyonu](https://docs.expo.dev/get-started/expo-go/)
- [Expo SDK Referansı](https://docs.expo.dev/versions/latest/)
- [React Navigation Dokümantasyonu](https://reactnavigation.org/)

## 🎨 Özellikler

✨ **Ruh Hali Bazlı Mekan Önerileri**
- Kullanıcının ruh haline göre özelleştirilmiş mekan önerileri
- Overpass API (OpenStreetMap) entegrasyonu
- Foursquare API desteği (opsiyonel)

🗺️ **Harita Entegrasyonu**
- React Native Maps ile interaktif harita
- Mekan detayları ve navigasyon
- Rota oluşturma

👥 **Sosyal Özellikler**
- Arkadaşlarla mekan paylaşımı
- Favori mekanlar
- Mekan değerlendirme

## 💡 İpuçları

1. **Geliştirme Sırasında:** Kod değişiklikleriniz otomatik olarak uygulamaya yansır (Hot Reload)
2. **Debug:** Expo Go'da uygulamayı sallayarak geliştirici menüsünü açabilirsiniz
3. **Network:** Bilgisayarınız ve telefonunuz aynı WiFi ağında olmalı

---

**Başarılar! 🚀**

Herhangi bir sorun yaşarsanız Expo'nun [troubleshooting kılavuzuna](https://docs.expo.dev/troubleshooting/overview/) göz atabilirsiniz.
