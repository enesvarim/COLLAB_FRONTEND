import axios from 'axios';

// API URL'sini https://collab-47bg.onrender.com/api olarak güncelle
const API_URL = 'https://collab-47bg.onrender.com/api';

console.log('API endpoint:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials özelliğini false olarak değiştiriyoruz
  // bu özellik bazen CORS hatalarına neden olabilir
  withCredentials: false
});

// Request interceptor - auth token eklemek için
api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error('Token okuma hatası:', error);
    }
    return config;
  },
  (error) => {
    console.error('API isteği gönderilirken hata:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarını ve diğer hataları işlemek için
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API hata detayları:', error);

    if (error.response) {
      console.error('Sunucu yanıtı:', error.response.status, error.response.data);

      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    else if (error.request) {
      console.error('Sunucu yanıt vermedi:', error.request);
    }
    else {
      console.error('İstek hatası:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
