import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { api } from '../config';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${api}/profile`, {
          credentials: 'include', // ⬅️ Envía la cookie automáticamente
        });

        if (!res.ok) {
          if (res.status === 401) {
            // Token inválido o expirado
            logout();
            navigate('/login');
            return;
          }
          throw new Error('Error al obtener el perfil');
        }

        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate, logout]);

  const handleLogout = async () => {
    try {
      await fetch(`${api}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      logout(); // Limpia el contexto
      navigate('/login');
    }
  };

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'radial-gradient(circle at 10% 20%, #1e293b, #0b1120)',
        }}
      >
        <CircularProgress sx={{ color: '#60a5fa' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
          No se pudo cargar el perfil.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: '20px',
            color: 'white',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#60a5fa',
                fontSize: 40,
                mb: 2,
              }}
            >
              {profileData.name?.charAt(0).toUpperCase() || <PersonIcon />}
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {profileData.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#94a3b8', mb: 3 }}>
              {profileData.email}
            </Typography>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#334155' }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <EmailIcon sx={{ color: '#60a5fa' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Correo electrónico
                  </Typography>
                  <Typography variant="body1">{profileData.email}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarIcon sx={{ color: '#60a5fa' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Miembro desde
                  </Typography>
                  <Typography variant="body1">
                    {profileData.created_at
                      ? new Date(profileData.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Fecha no disponible'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#334155' }} />

          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '50px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 15px rgba(239,68,68,0.3)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 25px rgba(239,68,68,0.5)',
                },
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;