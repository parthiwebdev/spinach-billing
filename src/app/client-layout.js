'use client';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import AuthGuard from '../components/AuthGuard';
import FirebaseInitializer from '../components/FirebaseInitializer';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export default function ClientLayout({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const isSignInPage = pathname === '/signin';

  return (
    <AuthGuard>
      {/* Initialize Firebase real-time listeners */}
      <FirebaseInitializer />

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {isAuthenticated && !isSignInPage && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            minHeight: '100vh',
          }}
        >
          {children}
        </Box>
        {isAuthenticated && !isSignInPage && <BottomNav />}
      </Box>
    </AuthGuard>
  );
}
