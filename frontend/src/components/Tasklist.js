import { useEffect, useState } from "react";
import { api } from "../config";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Importar contexto
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
  Stack,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Estilos personalizados para las tarjetas
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  transition: 'all 0.3s ease',
  borderLeft: '6px solid #60a5fa',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
  },
}));

const StyledCardContent = styled(CardContent)({
  padding: '20px 24px',
  '&:last-child': {
    paddingBottom: '20px',
  },
});

export default function TaskList() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ Para verificar autenticación y cerrar sesión
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${api}/tasks`, {
        credentials: 'include', // ✅ Enviar cookie HttpOnly
      });

      if (res.status === 401) {
        // Token inválido o expirado
        logout();
        navigate('/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('No se pudieron cargar las tareas. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      navigate('/login');
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Filtrar tareas por título (insensible a mayúsculas)
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const res = await fetch(`${api}/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include', // ✅ Enviar cookie
      });

      if (res.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      if (!res.ok) {
        throw new Error('Error al eliminar');
      }

      // Actualizar la lista local
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('No se pudo eliminar la tarea.');
    }
  };

  const handleEdit = (id) => {
    navigate(`/task/edit/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, color: '#f1f5f9' }}>
          Lista de Tareas
        </Typography>
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ bgcolor: '#1e293b' }} />
          ))}
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: '800px', margin: '0 auto' }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: 700,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '2px solid rgba(255,255,255,0.1)',
          pb: 2,
        }}
      >
        <AssignmentIcon sx={{ fontSize: 32, color: '#60a5fa' }} />
        Mis Tareas
        <Chip
          label={filteredTasks.length}
          color="primary"
          size="small"
          sx={{
            ml: 'auto',
            bgcolor: '#60a5fa',
            fontWeight: 700,
            fontSize: '1rem',
            minWidth: '36px',
            color: '#fff',
          }}
        />
      </Typography>

      {tasks.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            bgcolor: '#1e293b',
            borderRadius: '20px',
            border: '2px dashed #475569',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#94a3b8' }}>
            No hay tareas aún
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
            Crea tu primera tarea usando el botón "Nueva Tarea".
          </Typography>
        </Box>
      ) : filteredTasks.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            bgcolor: '#1e293b',
            borderRadius: '20px',
            border: '2px dashed #475569',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, color: '#475569', mb: 2 }} />
          <Typography variant="h5" sx={{ color: '#94a3b8' }}>
            No se encontraron tareas
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
            Intenta con otro término de búsqueda.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filteredTasks.map((task) => (
            <StyledCard key={task.id}>
              <StyledCardContent>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={12} sm={8}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        color: '#f1f5f9',
                        fontWeight: 600,
                      }}
                    >
                      {task.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: '#cbd5e1',
                      }}
                    >
                      {task.description || 'Sin descripción'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                    >
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(task.id)}
                        sx={{
                          bgcolor: 'rgba(96,165,250,0.15)',
                          '&:hover': { bgcolor: 'rgba(96,165,250,0.3)' },
                        }}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(task.id)}
                        sx={{
                          bgcolor: 'rgba(244,67,54,0.15)',
                          '&:hover': { bgcolor: 'rgba(244,67,54,0.3)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </StyledCardContent>
            </StyledCard>
          ))}
        </Stack>
      )}
    </Box>
  );
}