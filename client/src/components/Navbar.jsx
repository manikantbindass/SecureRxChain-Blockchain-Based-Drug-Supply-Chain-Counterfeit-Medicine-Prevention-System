// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Menu, MenuItem, Avatar, Chip, Tooltip, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon, AccountCircle, LocalPharmacy,
  Factory, LocalShipping, PersonSearch, AdminPanelSettings,
  Logout, AccountBalanceWallet, VerifiedUser
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const roleConfig = {
  manufacturer: { label: 'Manufacturer', icon: <Factory />, color: '#1976d2', path: '/manufacturer' },
  distributor: { label: 'Distributor', icon: <LocalShipping />, color: '#388e3c', path: '/distributor' },
  pharmacy: { label: 'Pharmacy', icon: <LocalPharmacy />, color: '#f57c00', path: '/pharmacy' },
  consumer: { label: 'Consumer', icon: <PersonSearch />, color: '#7b1fa2', path: '/consumer' },
  admin: { label: 'Admin', icon: <AdminPanelSettings />, color: '#c62828', path: '/admin' },
};

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { address, isConnected, connect, disconnect, formatAddress } = useWallet();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const role = user?.role;
  const cfg = roleConfig[role];

  const navLinks = cfg ? [
    { label: 'Dashboard', path: cfg.path },
  ] : [];

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">SecureRxChain</Typography>
        {user && <Typography variant="caption">{user.name}</Typography>}
      </Box>
      <Divider />
      <List>
        {navLinks.map((link) => (
          <ListItem button key={link.label} component={Link} to={link.path}>
            <ListItemText primary={link.label} />
          </ListItem>
        ))}
        <ListItem button component={Link} to="/verify">
          <ListItemIcon><VerifiedUser /></ListItemIcon>
          <ListItemText primary="Verify Drug" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#0d1117', boxShadow: '0 1px 0 rgba(255,255,255,0.1)' }}>
      <Toolbar>
        {isMobile && (
          <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 0, fontWeight: 700, color: '#58a6ff', textDecoration: 'none', mr: 3 }}
        >
          SecureRxChain
        </Typography>

        {cfg && !isMobile && (
          <Chip
            icon={cfg.icon}
            label={cfg.label}
            size="small"
            sx={{ bgcolor: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}`, mr: 2 }}
          />
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <Button color="inherit" component={Link} to="/verify" startIcon={<VerifiedUser />} sx={{ mr: 1 }}>
            Verify
          </Button>
        )}

        <Tooltip title={isConnected ? `Connected: ${formatAddress(address)}` : 'Connect Wallet'}>
          <Chip
            icon={<AccountBalanceWallet />}
            label={isConnected ? formatAddress(address) : 'Connect Wallet'}
            onClick={isConnected ? disconnect : connect}
            color={isConnected ? 'success' : 'default'}
            variant={isConnected ? 'filled' : 'outlined'}
            size="small"
            sx={{ mr: 2, cursor: 'pointer' }}
          />
        </Tooltip>

        {user && (
          <>
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: cfg?.color || 'grey.500', fontSize: 14 }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleClose(); navigate(cfg?.path || '/'); }}>
                <AccountCircle sx={{ mr: 1 }} /> Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
