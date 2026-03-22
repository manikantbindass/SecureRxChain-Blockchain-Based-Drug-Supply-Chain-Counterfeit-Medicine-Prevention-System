import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, InputAdornment, IconButton } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { keyframes } from '@emotion/react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const gradientBg = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      // Route based on role
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login Failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(-45deg, #1e3c72, #2a5298, #6dd5ed, #2193b0)',
        backgroundSize: '400% 400%',
        animation: `${gradientBg} 15s ease infinite`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative floating elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          top: '-10%',
          left: '-5%',
          animation: `${float} 6s ease-in-out infinite`,
          backdropFilter: 'blur(10px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          bottom: '-15%',
          right: '-10%',
          animation: `${float} 8s ease-in-out infinite reverse`,
          backdropFilter: 'blur(10px)',
        }}
      />

      <Paper
        elevation={24}
        sx={{
          padding: { xs: 4, md: 6 },
          width: '100%',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          animation: `${fadeIn} 0.8s ease-out`,
          zIndex: 1,
          mx: 2,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              p: 2,
              borderRadius: '50%',
              mb: 2,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <ShieldCheck color="white" size={40} />
          </Box>
          <Typography variant="h4" fontWeight="800"
            sx={{
              background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}>
            SecureRxChain
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" mt={1}>
            Welcome back to the secure supply chain
          </Typography>
        </Box>

        {error && (
          <Box sx={{ 
            bgcolor: 'error.light', 
            color: 'error.contrastText', 
            p: 1.5, 
            borderRadius: 2, 
            mb: 3, 
            textAlign: 'center',
            animation: `${fadeIn} 0.3s ease-in-out` 
          }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail size={20} color="#757575" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.9)' }
            }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={20} color="#757575" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: 'rgba(255,255,255,0.9)' }
            }}
            sx={{ mb: 4 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
              color: 'white',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 3px 15px rgba(30, 60, 114, 0.4)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(30, 60, 114, 0.6)',
                background: 'linear-gradient(45deg, #2a5298 30%, #1e3c72 90%)',
              }
            }}
          >
            Secure Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
