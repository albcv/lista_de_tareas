import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { api } from '../config';
import { useAuth } from '../context/AuthContext';

// Estilos personalizados
const StyledCard = styled(Card)(({ theme }) => ({
  mt: 5,
  padding: theme.spacing(2),
  background: 'linear-gradient(145deg, #1e293b, #0f172a)',
  borderRadius: '20px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.01)',
  },
}));

const StyledTextField = styled(TextField)({
  '& .MuiFilledInput-root': {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    '&:hover': {
      background: 'rgba(255,255,255,0.12)',
    },
    '&.Mui-focused': {
      background: 'rgba(255,255,255,0.15)',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94a3b8',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#3b82f6',
  },
  '& .MuiFilledInput-input': {
    color: '#f1f5f9',
  },
});

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({
    title: false,
    description: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
    setErrorMsg('');
  };

  const validate = () => {
    const newErrors = {
      title: formData.title.trim() === '',
      description: false,
    };
    setErrors(newErrors);
    return !newErrors.title;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');
    setSubmitted(false);

    try {
      const url = editing ? `${api}/tasks/${id}` : `${api}/tasks`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al guardar la tarea');
      }

      const data = await res.json();
      console.log(editing ? '✅ Tarea editada:' : '✅ Tarea creada:', data);

      setSubmitted(true);
      navigate('/tasks');
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTask = async (taskId) => {
      setLoadingTask(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${api}/tasks/${taskId}`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Error al cargar la tarea');
        }

        const data = await res.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
        });
        setEditing(true);
      } catch (error) {
        console.error('❌ Error al cargar tarea:', error);
        setErrorMsg('No se pudo cargar la tarea. Intenta de nuevo.');
      } finally {
        setLoadingTask(false);
      }
    };

    if (id) {
      loadTask(id);
    }
  }, [id, logout, navigate]);

  if (loadingTask) {
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
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      direction="column"
      sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 10% 20%, #1e293b, #0b1120)' }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <StyledCard>
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            ✨ {editing ? 'Editar Tarea' : 'Crear Tarea'}
          </Typography>

          <CardContent>
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorMsg}
                </Alert>
              )}

              {submitted && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ ¡Tarea guardada con éxito! Redirigiendo...
                </Alert>
              )}

              <StyledTextField
                fullWidth
                variant="filled"
                label="Título"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                helperText={errors.title && 'El título es obligatorio'}
                sx={{ display: 'block', mb: 2 }}
              />

              <StyledTextField
                fullWidth
                variant="filled"
                label="Descripción (opcional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{ display: 'block', mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.title.trim()}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 8px 20px rgba(59,130,246,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 12px 28px rgba(59,130,246,0.5)',
                  },
                }}
              >
                {loading ? <CircularProgress color="inherit" size={24} /> : '💾 Guardar Tarea'}
              </Button>
            </form>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
}