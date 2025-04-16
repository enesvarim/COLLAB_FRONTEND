export const authHeader = () => {
  const token = localStorage.getItem('token'); // JWT token'ı localStorage'dan al
  return token ? `Bearer ${token}` : '';
};
