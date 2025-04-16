import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import ConnectionTest from '../components/ConnectionTest';

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState(null); // null: bilinmiyor, true: çalışıyor, false: çalışmıyor

  // Sayfa yüklendiğinde backend bağlantısını test et
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('https://collab-47bg.onrender.com/api/auth/login', {
          method: 'HEAD',
          mode: 'no-cors'
        });
        setServerStatus(true);
      } catch (error) {
        console.error('Sunucu bağlantı kontrolü başarısız:', error);
        setServerStatus(false);
      }
    };

    checkServerStatus();
  }, []);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Geçersiz e-posta adresi').required('E-posta gerekli'),
      password: Yup.string().required('Şifre gerekli'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const result = await loginUser(values);
        if (result.success) {
          toast.success('Giriş başarılı!');
          navigate('/dashboard');
        } else {
          toast.error(result.message || 'Giriş başarısız.');
        }
      } catch (error) {
        console.error('Giriş hatası:', error);
        toast.error(error.message || 'Giriş yapılırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-card">
        <Typography variant="h4" align="center" gutterBottom>
          Collab'e Hoşgeldiniz
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Projelerinizi yönetmek için giriş yapın
        </Typography>

        {serverStatus === false && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error" align="center">
              Backend sunucusuna bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.
            </Typography>
          </Box>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="E-posta"
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Şifre"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Hesabınız yok mu?{' '}
            <MuiLink component={Link} to="/register">
              Kaydolun
            </MuiLink>
          </Typography>
        </Box>

        {/* Backend durumunu test etmek için butonu ekleyin */}
        <Box mt={2} textAlign="center">
          <Button
            size="small"
            onClick={async () => {
              try {
                const isConnected = await fetch('https://collab-47bg.onrender.com/api/auth/login', {
                  method: 'HEAD',
                  mode: 'no-cors'
                });
                setServerStatus(true);
                toast.success('Backend bağlantısı kuruldu!');
              } catch (error) {
                setServerStatus(false);
                toast.error('Backend sunucusuna bağlanılamıyor!');
              }
            }}
          >
            Backend Bağlantısını Test Et
          </Button>
        </Box>

        <ConnectionTest />
      </Paper>
    </Box>
  );
};

export default Login;
