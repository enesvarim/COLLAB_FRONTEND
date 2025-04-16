import api from './api';

export const login = async (credentials) => {
  try {
    console.log('Giriş isteği gönderiliyor:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    console.log('Giriş yanıtı alındı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Giriş hatası detayları:', error);

    // Daha spesifik hata mesajları için kontrol
    if (error.response) {
      // Sunucu bir hata yanıtı döndürdü
      const errorMessage = error.response.data?.message || 'Giriş başarısız.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Sunucuya istek gönderildi ama yanıt alınamadı
      throw new Error('Sunucu yanıt vermiyor. Lütfen backend servisinin çalıştığından emin olun veya daha sonra tekrar deneyin.');
    } else {
      // İstek gönderilirken bir sorun oluştu
      throw new Error('Bağlantı hatası: ' + error.message);
    }
  }
};

export const register = async (userData) => {
  try {
    console.log('Kayıt isteği gönderiliyor:', userData.email);
    const response = await api.post('/auth/register', userData);
    console.log('Kayıt yanıtı alındı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Kayıt hatası detayları:', error);

    // Daha spesifik hata mesajları için kontrol
    if (error.response) {
      // Sunucu bir hata yanıtı döndürdü
      const errorMessage = error.response.data?.message || 'Kayıt başarısız.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Sunucuya istek gönderildi ama yanıt alınamadı
      throw new Error('Sunucu yanıt vermiyor. Lütfen backend servisinin çalıştığından emin olun veya daha sonra tekrar deneyin.');
    } else {
      // İstek gönderilirken bir sorun oluştu
      throw new Error('Bağlantı hatası: ' + error.message);
    }
  }
};

// Backend bağlantı durumunu test etmek için
export const checkServerConnection = async () => {
  try {
    // Basit bir istek gönderip cevap alıp alamadığımızı kontrol edelim
    await api.get('/auth/health');
    return true;
  } catch (error) {
    console.error('Backend bağlantı hatası:', error);
    return false;
  }
};
