'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingBag as ProductsIcon,
  People as CustomersIcon,
  Receipt as OrdersIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(0);

  // Map routes to navigation values
  const routeToValue = {
    '/': 0,
    '/products': 1,
    '/customers': 2,
    '/orders': 3,
    '/create-order': 3,
    '/settings': 4,
  };

  // Update value based on current route
  useEffect(() => {
    const navValue = routeToValue[pathname] ?? 0;
    setValue(navValue);
  }, [pathname]);

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
          <BottomNavigationAction
            label="Home"
            icon={<HomeIcon />}
            onClick={() => handleNavigation('/')}
          />
          <BottomNavigationAction
            label="Products"
            icon={<ProductsIcon />}
            onClick={() => handleNavigation('/products')}
          />
          <BottomNavigationAction
            label="Customers"
            icon={<CustomersIcon />}
            onClick={() => handleNavigation('/customers')}
          />
          <BottomNavigationAction
            label="Orders"
            icon={<OrdersIcon />}
            onClick={() => handleNavigation('/orders')}
          />
          <BottomNavigationAction
            label="Settings"
            icon={<SettingsIcon />}
            onClick={() => handleNavigation('/settings')}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;
