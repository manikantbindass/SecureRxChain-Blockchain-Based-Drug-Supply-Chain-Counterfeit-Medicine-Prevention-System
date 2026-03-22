import { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
          SecureRxChain
        </Typography>
        <Box>
          {user ? (
            <>
              <Typography variant="body1" component="span" sx={{ mr: 2 }}>
                {user.name} ({user.role})
                {user.walletAddress && ` | Wallet: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
