import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Link as MuiLink, CircularProgress } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Ad gerekli'),
      lastName: Yup.string().required('Soyad gerekli'),
      email: Yup.string().email('Geçersiz e-posta adresi').required('E-posta gerekli'),
      password: Yup.string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre gerekli'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmelidir')
        .required('Şifre tekrarı gerekli'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const { confirmPassword, ...userData } = values;
        const result = await registerUser(userData);
        
        if (result.success) {
          toast.success('Kayıt başarılı!');
          navigate('/dashboard');
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Kayıt olunurken bir hata oluştu.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box className="auth-container">
      <Paper elevation={3} className="auth-card">
        <Typography variant="h4" align="center" gutterBottom>
          Collab'e Kaydolun
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Yeni bir hesap oluşturun
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="Ad"
              variant="outlined"
              margin="normal"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="Soyad"
              variant="outlined"
              margin="normal"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Box>
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
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Şifre Tekrar"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
            {loading ? <CircularProgress size={24} /> : 'Kaydol'}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Zaten hesabınız var mı?{' '}
            <MuiLink component={Link} to="/login">
              Giriş yapın
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
