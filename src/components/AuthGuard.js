'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import { isEmailAuthorized } from '../config/authorizedUsers';
import { Box, CircularProgress } from '@mui/material';

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

    // If authenticated and on signin page, redirect to home
    if (isAuthenticated && isPublicRoute) {
      router.push('/');
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

  return <>{children}</>;
}
