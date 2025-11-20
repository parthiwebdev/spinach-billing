'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { toggleTheme } from '../../store/slices/themeSlice';
import { logout, selectUser } from '../../store/slices/authSlice';

export default function Settings() {
  const dispatch = useDispatch();
  const router = useRouter();
  const mode = useSelector((state) => state.theme.mode);
  const user = useSelector(selectUser);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    dispatch(logout());
    router.push('/signin');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' } }}>
            Settings
          </Typography>
        </Box>

        <Paper sx={{ overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {/* Appearance Section */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Appearance
              </Typography>
            </Box>

            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {mode === 'dark' ? (
                  <DarkModeIcon sx={{ color: 'primary.main' }} />
                ) : (
                  <LightModeIcon sx={{ color: 'primary.main' }} />
                )}
              </Box>
              <ListItemText
                primary="Dark Mode"
                secondary={mode === 'dark' ? 'Dark theme is enabled' : 'Light theme is enabled'}
              />
              <ListItemSecondaryAction>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={handleThemeToggle}
                      color="primary"
                    />
                  }
                  label=""
                />
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />

            {/* Application Info Section */}
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover', mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Application Info
              </Typography>
            </Box>

            <ListItem>
              <ListItemText
                primary="Version"
                secondary="1.0.0"
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Application Name"
                secondary="Vegetables Billing System"
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemText
                primary="Developer"
                secondary="Parthiban R"
              />
            </ListItem>
          </List>
        </Paper>

        {/* Account Section */}
        <Paper sx={{ overflow: 'hidden', mt: 3 }}>
          <List sx={{ p: 0 }}>
            <Box sx={{ px: 3, py: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Account
              </Typography>
            </Box>

            {user && (
              <>
                <ListItem>
                  <ListItemText
                    primary="Logged in as"
                    secondary={user.email}
                  />
                </ListItem>

                <Divider />
              </>
            )}

            <ListItemButton onClick={handleLogoutClick}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                secondary="Sign out of your account"
                primaryTypographyProps={{ color: 'error' }}
              />
            </ListItemButton>
          </List>
        </Paper>
      </Container>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to sign in again to access the application.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
