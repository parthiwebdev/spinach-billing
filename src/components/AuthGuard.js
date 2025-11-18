'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { isEmailAuthorized, canAccessPage, isAdmin } from '../config/authorizedUsers';
import { Box, CircularProgress, Container, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/signin'];

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/signin');
      return;
    }

    // If authenticated, verify the user's email is still authorized
    if (isAuthenticated && user) {
      if (!isEmailAuthorized(user.email)) {
        // User is no longer authorized, redirect to signin
        router.push('/signin');
        return;
      }
    }

    // If authenticated and on signin page, redirect to appropriate page
    if (isAuthenticated && isPublicRoute) {
      // Redirect non-admins to create-order, admins to home
      if (isAdmin(user?.email)) {
        router.push('/');
      } else {
        router.push('/create-order');
      }
    }
  }, [isAuthenticated, user, pathname, router]);

  // Show loading state while checking authentication
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check page-level access for authenticated users
  if (isAuthenticated && user && !PUBLIC_ROUTES.includes(pathname)) {
    if (!canAccessPage(user.email, pathname)) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <Container maxWidth="sm">
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Access Denied
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You don't have permission to access this page.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/create-order')}
              >
                Go to Create Order
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
