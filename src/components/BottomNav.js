'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  Badge,
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  Receipt as OrdersIcon,
  Settings as SettingsIcon,
  AddCircle as CreateOrderIcon,
} from '@mui/icons-material';
import { selectUser } from '../store/slices/authSlice';
import { selectUnseenOrderCount } from '../store/slices/ordersSlice';
import { isAdmin } from '../config/authorizedUsers';

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(selectUser);
  const unseenOrderCount = useSelector(selectUnseenOrderCount);
  const userIsAdmin = isAdmin(user?.email);
  const [value, setValue] = useState(0);

  // Map routes to navigation values based on user role
  const adminRouteToValue = {
    '/': 0,
    '/products': 1,
    '/customers': 2,
    '/orders': 3,
    '/create-order': 3,
    '/settings': 4,
  };

  const userRouteToValue = {
    '/create-order': 0,
    '/settings': 1,
  };

  const routeToValue = userIsAdmin ? adminRouteToValue : userRouteToValue;

  // Update value based on current route
  useEffect(() => {
    const navValue = routeToValue[pathname] ?? 0;
    setValue(navValue);
  }, [pathname, userIsAdmin]);

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Paper elevation={8}>
        <BottomNavigation
          value={value}
          onChange={(_event, newValue) => setValue(newValue)}
          showLabels
          sx={{
            height: 65,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
            },
          }}
        >
          {userIsAdmin ? [
            // Admin navigation
            <BottomNavigationAction
              key="home"
              label="Home"
              icon={<HomeIcon />}
              onClick={() => handleNavigation('/')}
            />,
            <BottomNavigationAction
              key="products"
              label="Products"
              icon={<ProductsIcon />}
              onClick={() => handleNavigation('/products')}
            />,
            <BottomNavigationAction
              key="customers"
              label="Customers"
              icon={<CustomersIcon />}
              onClick={() => handleNavigation('/customers')}
            />,
            <BottomNavigationAction
              key="orders"
              label="Orders"
              icon={
                <Badge badgeContent={unseenOrderCount} color="error" max={99}>
                  <OrdersIcon />
                </Badge>
              }
              onClick={() => handleNavigation('/orders')}
            />,
            <BottomNavigationAction
              key="settings"
              label="Settings"
              icon={<SettingsIcon />}
              onClick={() => handleNavigation('/settings')}
            />
          ] : [
            // Regular user navigation - limited pages only
            <BottomNavigationAction
              key="create-order"
              label="Create Order"
              icon={<CreateOrderIcon />}
              onClick={() => handleNavigation('/create-order')}
            />,
            <BottomNavigationAction
              key="settings"
              label="Settings"
              icon={<SettingsIcon />}
              onClick={() => handleNavigation('/settings')}
            />
          ]}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
