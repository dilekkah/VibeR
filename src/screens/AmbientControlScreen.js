import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, PermissionsAndroid, Platform, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Örnek kafe verisi (Gerçek uygulamada API'den gelmelidir)
const DUMMY_CAFES = [
  // Cihangir / Beyoğlu
  { id: '101', name: 'MOC Bomontiada', latitude: 41.0560, longitude: 28.9856, distance: 0, vibe: 'Modern, Enerjik, Çalışma', liveStatus: { calm: 60, crowd: 40 } },
  { id: '102', name: 'Coffee Sapiens Karaköy', latitude: 41.0252, longitude: 28.9772, distance: 0, vibe: 'Popüler, Kalabalık, Sohbet', liveStatus: { calm: 20, crowd: 80 } },
  { id: '103', name: 'Petra Roasting Co. Gayrettepe', latitude: 41.0664, longitude: 29.0068, distance: 0, vibe: 'Hızlı, Odaklanma, İyi Kahve', liveStatus: { calm: 50, crowd: 50 } },

  // Kadıköy / Anadolu Yakası
  { id: '201', name: 'Montag Coffee Roasters Kadıköy', latitude: 40.9926, longitude: 29.0253, distance: 0, vibe: 'Sessiz, Sanatsal, Çalışma', liveStatus: { calm: 75, crowd: 25 } },
  { id: '202', name: 'Story Coffee Moda', latitude: 40.9855, longitude: 29.0270, distance: 0, vibe: 'Gürültülü, Trend, Sohbet', liveStatus: { calm: 30, crowd: 70 } },
  { id: '203', name: 'Walters Coffee Roastery', latitude: 40.9877, longitude: 29.0305, distance: 0, vibe: 'Konsept, Orta Kalabalık', liveStatus: { calm: 45, crowd: 55 } },

  // Beşiktaş / Ortaköy
  { id: '301', name: 'Federal Coffee Company Beşiktaş', latitude: 41.0410, longitude: 29.0040, distance: 0, vibe: 'Merkezi, Odaklanma, Atıştırmalık', liveStatus: { calm: 65, crowd: 35 } },
  { id: '302', name: 'Coffeetopia (Yakın Bir Lokasyon)', latitude: 41.0360, longitude: 28.9950, distance: 0, vibe: 'Geniş, Rahat, Sessiz', liveStatus: { calm: 80, crowd: 20 } },
];

// İki nokta arasındaki mesafeyi hesaplamak için (Haversine formülü)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya'nın yarıçapı km cinsinden
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // Kilometre cinsinden 1 ondalık basamaklı
};

const AmbientControlScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestCafes, setNearestCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Konum İzni İsteği ve Konumu Alma
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Konum İzni",
            message: "Uygulamanız size en yakın kafeleri göstermek için konumunuza erişmek istiyor.",
            buttonNeutral: "Daha Sonra",
            buttonNegative: "Reddet",
            buttonPositive: "İzin Ver"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Konum İzni Reddedildi", "En yakın mekanları görmek için konum izni gereklidir.");
          setLoading(false);
          return;
        }
      }

      // İzin verildiyse veya iOS ise doğrudan konumu al
      Geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          Alert.alert("Konum Hatası", error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // 2. Kafeleri Konuma Göre Filtreleme
  useEffect(() => {
    if (userLocation) {
      const { latitude, longitude } = userLocation;

      const cafesWithDistance = DUMMY_CAFES.map(cafe => ({
        ...cafe,
        distance: calculateDistance(latitude, longitude, cafe.latitude, cafe.longitude)
      }));

      // Mesafe en az olandan en çoğa doğru sırala
      cafesWithDistance.sort((a, b) => a.distance - b.distance);

      setNearestCafes(cafesWithDistance);
    }
  }, [userLocation]);

  // A. Canlı Görsel Yükleme İşlemini Başlatma
  const handleUploadImage = (cafeId, cafeName) => {
    // Gerçek uygulamada burada kamera/galeri açma ve
    // fotoğrafı sunucuya yükleme işlemleri başlatılacaktır.
    Alert.alert(
      "Görsel Yükleme",
      `${cafeName} için görsel yükleme iş akışı başlatılacak (ID: ${cafeId}).`,
      [{ text: "Tamam" }]
    );
  };

  // B. Kafe Detay/Rating Ekranına Geçiş
  const handleNavigateToCafeDetail = (cafeId, cafeName) => {
    navigation.navigate('Rating', {
      place: {
        title: cafeName,
        id: cafeId
      }
    });
  };

  // Görünüm (Render)
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Konumunuz alınıyor ve mekanlar yükleniyor...</Text>
      </View>
    );
  }

  // Kafe Listesi Elemanı (renderItem)
  const renderItem = ({ item }) => (
    // TÜM KARTA BASILINCA RATING EKRANINA GİT
    <TouchableOpacity
      style={styles.cafeCard}
      onPress={() => handleNavigateToCafeDetail(item.id, item.name)}
      activeOpacity={0.8}
    >
      {/* Üst Satır: İsim, Mesafe ve Kamera Butonu */}
      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
            <Text style={styles.cafeName}>{item.name}</Text>
            <Text style={styles.cafeDistance}>{item.distance} km uzaklıkta</Text>
        </View>

        {/* Canlı Görsel Yükleme Butonu */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={(e) => {
              // FlatList'teki kartın onPress olayının tetiklenmesini engelle
              e.stopPropagation();
              handleUploadImage(item.id, item.name);
          }}
        >
          <Text style={styles.uploadButtonText}>📸 Yükle</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cafeVibe}>Vibe: {item.vibe}</Text>

      {/* 2. Canlı Durum Bilgileri */}
      {item.liveStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>CANLI DURUM:</Text>

          {/* Sakinlik Oranı */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Sakinlik Oranı: </Text>
            <View style={[styles.bar, { width: `${item.liveStatus.calm}%`, backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusValue}>{item.liveStatus.calm}%</Text>
          </View>

          {/* Kalabalık Oranı */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Kalabalık Oranı: </Text>
            <View style={[styles.bar, { width: `${item.liveStatus.crowd}%`, backgroundColor: '#F44336' }]} />
            <Text style={styles.statusValue}>{item.liveStatus.crowd}%</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gerçek Zamanlı Vibe Kontrolü</Text>

      {nearestCafes.length > 0 ? (
        <>
          <Text style={styles.subHeader}>Size En Yakın Mekanlar</Text>
          <FlatList
            data={nearestCafes}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <Text style={styles.noData}>Mekanları filtrelemek için konum izni gereklidir.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555',
  },
  cafeCard: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  headerInfo: {
      flex: 1,
      marginRight: 10,
  },
  uploadButton: {
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#e6f2ff',
    marginLeft: 10,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cafeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cafeDistance: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  cafeVibe: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 5,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  statusContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    width: 120,
    color: '#555',
  },
  bar: {
    height: 10,
    borderRadius: 5,
    marginRight: 5,
    flex: 1,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 40,
    textAlign: 'right',
  }
});

export default AmbientControlScreen;
