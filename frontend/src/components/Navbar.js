import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ListAlt as ListAltIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

// Barra de búsqueda estilizada
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('q');
      setSearchParams(newParams);
    }
  };

  const handleClearSearch = () => {
    setInputValue('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams);
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) => setMobileMenuAnchor(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}>
      <AppBar
        position="static"
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
                color: 'white',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                '&:hover': { color: '#3b82f6' },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1,
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  borderRadius: '50%',
                  p: 0.6,
                }}
              >
                <ListAltIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              Lista de Tareas
            </Typography>

            {!isMobile && (
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Buscar tarea…"
                  value={inputValue}
                  onChange={handleSearchChange}
                  inputProps={{ 'aria-label': 'buscar' }}
                  endAdornment={
                    inputValue && (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ mr: 1, color: 'inherit' }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                />
              </Search>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              onClick={() => navigate('/task/new')}
              startIcon={<AddIcon />}
              sx={{
                mr: 2,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 15px rgba(59,130,246,0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(59,130,246,0.6)',
                },
              }}
            >
              {isMobile ? '' : 'Nueva Tarea'}
            </Button>

            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                ml: 1,
                border: '2px solid rgba(255,255,255,0.2)',
                '&:hover': { borderColor: '#3b82f6' },
              }}
            >
              <Avatar
                alt={user?.name || 'Usuario'}
                src="/static/images/avatar/1.jpg"
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile}>Perfil</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>

            {isMobile && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMobileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={handleMobileMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 2,
                      backgroundColor: '#1e293b',
                      color: 'white',
                      width: '200px',
                    },
                  }}
                >
                  <MenuItem component={Link} to="/tasks" onClick={handleMobileMenuClose}>
                    <ListAltIcon sx={{ mr: 1 }} /> Mis Tareas
                  </MenuItem>
                  <MenuItem component={Link} to="/task/new" onClick={handleMobileMenuClose}>
                    <AddIcon sx={{ mr: 1 }} /> Nueva Tarea
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}