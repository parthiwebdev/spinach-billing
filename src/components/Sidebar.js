'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Badge,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  Receipt as OrdersIcon,
  AddCircle as CreateOrderIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/slices/themeSlice';
import { selectUser, selectIsAuthenticated, logout } from '../store/slices/authSlice';
import { selectUnseenOrderCount } from '../store/slices/ordersSlice';
import { isAdmin } from '../config/authorizedUsers';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

const Sidebar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const mode = useSelector((state) => state.theme.mode);
  const unseenOrderCount = useSelector(selectUnseenOrderCount);
  const userIsAdmin = isAdmin(user?.email);

  const [collapsed, setCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

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

  // Admin navigation items
  const adminNavItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/products', label: 'Products', icon: <ProductsIcon /> },
    { path: '/customers', label: 'Customers', icon: <CustomersIcon /> },
    { path: '/create-order', label: 'Create Order', icon: <CreateOrderIcon /> },
    { path: '/orders', label: 'Orders', icon: <OrdersIcon />, badge: unseenOrderCount },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  // Regular user navigation items
  const userNavItems = [
    { path: '/create-order', label: 'Create Order', icon: <CreateOrderIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const navItems = userIsAdmin ? adminNavItems : userNavItems;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            Vegetables Billing
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={handleCollapse} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* User Info */}
      {isAuthenticated && user && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: collapsed && !isMobile ? 40 : 48,
              height: collapsed && !isMobile ? 40 : 48,
            }}
          >
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          {(!collapsed || isMobile) && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
              <Tooltip title={collapsed && !isMobile ? item.label : ''} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 0 : 56,
                      color: isActive ? 'inherit' : 'text.secondary',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error" max={99}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Bottom Actions */}
      <Box sx={{ p: 1 }}>
        <ListItem disablePadding>
          <Tooltip title={collapsed && !isMobile ? 'Toggle Theme' : ''} placement="right">
            <ListItemButton
              onClick={handleThemeToggle}
              sx={{ borderRadius: 2, justifyContent: collapsed && !isMobile ? 'center' : 'flex-start' }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed && !isMobile ? 0 : 56,
                  color: 'text.secondary',
                  justifyContent: 'center',
                }}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              {(!collapsed || isMobile) && (
                <ListItemText
                  primary={`${mode === 'light' ? 'Dark' : 'Light'} Mode`}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {isAuthenticated && (
          <ListItem disablePadding>
            <Tooltip title={collapsed && !isMobile ? 'Logout' : ''} placement="right">
              <ListItemButton
                onClick={handleLogoutClick}
                sx={{
                  borderRadius: 2,
                  color: 'error.main',
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && !isMobile ? 0 : 56,
                    color: 'error.main',
                    justifyContent: 'center',
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                {(!collapsed || isMobile) && <ListItemText primary="Logout" />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to sign in again to access the application.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
