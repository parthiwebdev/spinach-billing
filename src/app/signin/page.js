'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import {
  Google as GoogleIcon,
} from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { setUser } from '@/store/slices/authSlice';
import { isEmailAuthorized } from '@/config/authorizedUsers';

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google OAuth login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');

      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = await userInfoResponse.json();
        console.log('Google user info:', userInfo);

        // Check if email is authorized
        if (!isEmailAuthorized(userInfo.email)) {
          setError('Access denied. Your email is not authorized to access this application.');
          setLoading(false);
          return;
        }

        // Dispatch user data to Redux store
        dispatch(setUser({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          sub: userInfo.sub,
        }));

        // Redirect to dashboard
        router.push('/');
      } catch (err) {
        setError('Failed to sign in with Google. Please try again.');
        setLoading(false);
      }
    },
    onError: () => {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={3}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            {/* Logo/Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: 'primary.main',
                }}
              >
                Vegetables Billing
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Sign in to your account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                Use your authorized Google account to continue
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => googleLogin()}
              disabled={loading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            {/* Info Text */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Only authorized users can access this application
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
