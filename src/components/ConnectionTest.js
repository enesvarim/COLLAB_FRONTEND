import React, { useState } from 'react';
import { Button, Typography, Box, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';

const ConnectionTest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setStatus(null);
    setResult(null);

    try {
      // Doğrudan axios ile istek yap ve withCredentials özelliğini kaldır
      const response = await axios.get('https://collab-47bg.onrender.com/api/auth/health', {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
        // withCredentials özelliği kaldırıldı
      });

      setStatus('success');
      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setStatus('error');

      if (error.response) {
        setResult(`Sunucu yanıtı: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        setResult('Sunucuya ulaşılamadı. Backend çalıştığından emin olun.');
      } else {
        setResult(`Hata: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        API Bağlantı Testi
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={testConnection}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Bağlantıyı Test Et'}
      </Button>

      {status && (
        <Box mt={2} p={2} bgcolor={status === 'success' ? 'success.light' : 'error.light'} borderRadius={1}>
          <Typography color={status === 'success' ? 'success.dark' : 'error.dark'}>
            {status === 'success' ? 'Bağlantı başarılı!' : 'Bağlantı hatası!'}
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {result}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default ConnectionTest;
