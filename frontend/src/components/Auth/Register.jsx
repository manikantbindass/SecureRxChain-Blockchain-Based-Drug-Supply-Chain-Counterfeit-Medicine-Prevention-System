import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, MenuItem } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';

// Hardhat local test accounts for simulation
const TEST_ACCOUNTS = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Admin
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Manuf
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", // Dist
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"  // Pharm
];

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'consumer' });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-assign predefined test key based on role to streamline demo
      let assignedKey = "";
      if (formData.role === 'manufacturer') assignedKey = TEST_ACCOUNTS[1];
      else if (formData.role === 'distributor') assignedKey = TEST_ACCOUNTS[2];
      else if (formData.role === 'pharmacy') assignedKey = TEST_ACCOUNTS[3];
      
      const payload = { ...formData, privateKey: assignedKey };
      const data = await register(payload);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration Failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Paper elevation={3} sx={{ padding: 4, width: '400px' }}>
        <Typography variant="h5" mb={2}>Register</Typography>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Name" margin="normal" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <TextField fullWidth label="Email" margin="normal" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <TextField fullWidth label="Password" type="password" margin="normal" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <TextField select fullWidth label="Role" margin="normal" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
            <MenuItem value="consumer">Consumer</MenuItem>
            <MenuItem value="manufacturer">Manufacturer</MenuItem>
            <MenuItem value="distributor">Distributor</MenuItem>
            <MenuItem value="pharmacy">Pharmacy</MenuItem>
          </TextField>
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>Register</Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register;
