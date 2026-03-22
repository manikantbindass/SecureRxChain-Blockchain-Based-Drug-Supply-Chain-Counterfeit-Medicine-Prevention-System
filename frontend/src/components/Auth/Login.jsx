import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    <Box display="flex" justifyContent="center" mt={10}>
      <Paper elevation={3} sx={{ padding: 4, width: '400px' }}>
        <Typography variant="h5" mb={2}>SecureRxChain Login</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
