# 🌍 Google Places API Entegrasyonu

## ✅ Yapılanlar

### 1. **UnifiedPlacesService** Oluşturuldu
Yeni servis dosyası: `src/services/UnifiedPlacesService.js`

**Ne Yapar?**
- Google Places API'den **gerçek mekanları** çeker
- API başarısız olursa **local database'e fallback** yapar
- **Hybrid yaklaşım**: Google + Local veriyi birleştirir

### 2. **RecommendationScreen** Güncellendi
- Artık `UnifiedPlacesService` kullanıyor
- Kullanıcının konumunu otomatik alıyor
- Gerçek mekanları + local veriyi birlikte gösteriyor

## 🚀 Nasıl Çalışıyor?

### **Akış:**

```
1. Kullanıcı filtreleri seçer (Mood, Companion, Need)
   ↓
2. UnifiedPlacesService çalışır:
   ├─ Google Places API'ye istek atar (kullanıcı konumu + filtreler)
   ├─ Gerçek mekanları bulur (cafe, restoran, vb.)
   ├─ Local database'den de öneriler ekler
   └─ Hepsini birleştirir
   ↓
3. Sonuçlar ekranda gösterilir:
   • Google Places'den gelenler: "Google Places" badge
   • Local database'den gelenler: Normal gösterim
```

## 🔧 API Key Sorunu Çözümü

### **Sorun:**
```
REQUEST_DENIED: This IP, site or mobile application is not
authorized to use this API key
```

### **Çözüm Adımları:**

1. **Google Cloud Console'a gidin:**
   https://console.cloud.google.com/apis/credentials

2. **API Key'i bulun ve düzenleyin:**
   - API key: `AIzaSyDCVXj6k7qDLPADwpvH3Sw_WQsMTYvlG_I`
   - "Edit" butonuna tıklayın

3. **Application restrictions:**

   **ÖNERİ A: Test için kısıtlamayı kaldırın**
   - ✅ **"None"** seçeneğini işaretleyin
   - Bu, tüm IP ve platformlardan erişim sağlar

   **VEYA**

   **ÖNERİ B: Sadece mobil uygulamaya izin verin**
   - ✅ "iOS apps" seçin → Bundle ID: `com.newproject`
   - ✅ "Android apps" seçin → Package name: `com.newproject`

4. **API restrictions (isteğe bağlı ama önerilen):**
   - ✅ "Restrict key" seçin
   - Sadece şunları seçin:
     - ✅ Places API
     - ✅ Places API (New)

5. **Kaydet ve bekleyin:**
   - "SAVE" butonuna basın
   - ⏱️ **5 dakika bekleyin** (değişiklikler yayılıyor)

6. **Test edin:**
   ```bash
   # Uygulamayı yeniden başlatın
   npx expo start

   # Veya sadece reload yapın (Expo'da 'r' tuşu)
   ```

## 📱 Kullanım

### **RecommendationScreen'de:**
- Mood seçin (örn: "Happy", "Relaxed")
- Companion seçin (örn: "Friends", "Partner")
- Need seçin (örn: "Eat", "Socialize")
- **Sonuçlar:**
  - ✅ Yakınındaki **gerçek mekanlar** (Google Places)
  - ✅ **Önerilen mekanlar** (Local database)

### **FeedScreen'de (İsteğe bağlı):**
Şu an sadece `RecommendationScreen`'de aktif. İsterseniz diğer ekranlara da ekleyebiliriz.

## 🎯 Avantajlar

### **✅ Hybrid Yaklaşım:**
- **Google Places başarılı olursa:** Gerçek, güncel mekan verileri
- **Google Places başarısız olursa:** Local database devreye girer
- **Her zaman çalışır:** API sorunu olsa bile uygulama kullanılabilir

### **✅ Zengin Veri:**
- Rating (⭐ 4.5/5)
- Adres (📍 Kadıköy, İstanbul)
- Fiyat seviyesi (💰 Orta)
- Fotoğraflar
- Kullanıcı yorumları

### **✅ Lokasyon Bazlı:**
- Kullanıcının **şu an bulunduğu yere** en yakın mekanları gösterir
- Radius (yarıçap) ayarlanabilir (1-5 km)

## 🧪 Test Senaryoları

### **Senaryo 1: Google Places Çalışıyor**
```
1. Uygulamayı aç
2. Konum iznini ver
3. "Öneri Al" ekranına git
4. Mood: "Happy", Companion: "Friends" seç
5. Sonuçlarda "Google Places" badge göreceksin
```

### **Senaryo 2: Google Places Çalışmıyor (Fallback)**
```
1. API key sorunlu veya internet yok
2. Uygulama otomatik local database'e geçer
3. Yine de öneriler gösterilir
4. Log: "⚠️ Fallback: LocalRecommendationService kullanılıyor"
```

## 📊 Log Mesajları

### **Başarılı:**
```
✅ Google Places API key yüklendi
📍 Kullanıcı konumu alındı: {lat, lng}
🌍 Google Places ile arama yapılıyor...
✅ Google Places: 5 mekan bulundu
📚 Local database: 20 öneri bulundu
✅ Unified Service: 25 sonuç (Google + Local)
```

### **Fallback:**
```
⚠️ Google Places'den sonuç gelmedi, local data kullanılıyor
⚠️ Fallback: LocalRecommendationService kullanılıyor
```

### **Hata:**
```
❌ Google Places API hatası: REQUEST_DENIED
❌ API Hata Detayı: This IP is not authorized
```

## 🔄 Sonraki Adımlar

### **1. API Key Sorununu Çöz (Öncelik 1)**
- Google Cloud Console'da kısıtlamaları kaldır
- 5 dakika bekle
- Test et

### **2. Diğer Ekranlara Ekle (İsteğe bağlı)**
İsterseniz şu ekranlara da ekleyebiliriz:
- `FeedScreen.js` - Feed'de gerçek mekanları göster
- `HomeScreen.js` - Ana sayfada öne çıkan yerler
- `FavoritesScreen.js` - Favorilere gerçek mekanları ekle

### **3. Fotoğraf Gösterimi**
Google Places'den gelen fotoğrafları göstermek için:
```javascript
const photoUrl = GooglePlacesService.getPhotoUrl(place.photos[0]);
```

### **4. Detay Sayfası**
Mekan detayları için:
```javascript
const details = await GooglePlacesService.getPlaceDetails(placeId);
// Telefon, website, çalışma saatleri, yorumlar
```

## 📝 Notlar

- **Cache:** UnifiedPlacesService 5 dakika cache kullanır (gereksiz API çağrılarını önler)
- **Rate Limiting:** Google Places API günlük/aylık quota'sı var, dikkatli kullanın
- **Maliyet:** Google Places API ücretli (ilk $200/ay ücretsiz)
- **Fallback:** API başarısız olsa bile uygulama çalışmaya devam eder

## 🆘 Sorun Giderme

### **"0 mekan bulundu" hatası:**
✅ **Çözüm:** API key kısıtlamalarını kaldır (yukarıda anlatıldı)

### **Konum alınamıyor:**
✅ **Çözüm:** Cihaz ayarlarından konum iznini kontrol et

### **API çok yavaş:**
✅ **Çözüm:** Radius'u küçült (2000m → 1000m)

### **API quota doldu:**
✅ **Çözüm:** Google Cloud Console'da quota'yı kontrol et, gerekirse artır

---

## 🎉 Sonuç

Artık uygulamanız:
- ✅ **Gerçek mekan verileri** kullanıyor (Google Places API)
- ✅ **Fallback sistemi** var (API başarısız olsa bile çalışır)
- ✅ **Lokasyon bazlı** öneriler sunuyor
- ✅ **Hybrid yaklaşım** (Google + Local data)

**Tek yapmanız gereken:** API key kısıtlamalarını kaldırmak! 🚀
