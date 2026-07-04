import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Avatar,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LockOutlined as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../config';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ⚠️ Asegúrate de que la URL sea correcta (ej. /users/login si usas prefijo)
      const res = await fetch(`${api}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      login(data.user);
      navigate('/tasks');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '20px',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#60a5fa' }}>
            <LockIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: 'white', mb: 2 }}>
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              sx={textFieldStyles}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={textFieldStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{
                        color: '#60a5fa', // Azul brillante
                        '&:hover': {
                          backgroundColor: 'rgba(96, 165, 250, 0.15)',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #60a5fa, #7c3aed)',
                borderRadius: '50px',
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(96,165,250,0.3)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 12px 28px rgba(96,165,250,0.5)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none' }}>
                ¿No tienes cuenta? Regístrate
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

// Estilos compartidos (con mayor contraste para el input)
const textFieldStyles = {
  input: { color: 'white' },
  label: { color: '#94a3b8' },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#334155' },
    '&:hover fieldset': { borderColor: '#60a5fa' },
    '&.Mui-focused fieldset': { borderColor: '#60a5fa' },
  },
};

export default Login;