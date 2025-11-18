'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { migrateAllData, migrateProducts, migrateCustomers } from '@/scripts/migrateData';

export default function MigratePage() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleMigrateAll = async () => {
    setStatus('loading');
    setError(null);
    setResults(null);

    try {
      const result = await migrateAllData();
      setResults(result);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleMigrateProducts = async () => {
    setStatus('loading');
    setError(null);
    setResults(null);

    try {
      const result = await migrateProducts();
      setResults({ products: result.count });
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleMigrateCustomers = async () => {
    setStatus('loading');
    setError(null);
    setResults(null);

    try {
      const result = await migrateCustomers();
      setResults({ customers: result.count });
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Firebase Data Migration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Migrate your existing products and customers data to Firebase Firestore
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Migration Options
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Products"
                secondary="10 spinach product variants will be migrated"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Customers"
                secondary="10 sample customers with zero pending balance will be migrated"
              />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleMigrateAll}
            disabled={status === 'loading'}
            startIcon={status === 'loading' ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            Migrate All
          </Button>
          <Button
            variant="outlined"
            onClick={handleMigrateProducts}
            disabled={status === 'loading'}
          >
            Products Only
          </Button>
          <Button
            variant="outlined"
            onClick={handleMigrateCustomers}
            disabled={status === 'loading'}
          >
            Customers Only
          </Button>
        </Box>

        {status === 'loading' && (
          <Alert severity="info" icon={<CircularProgress size={20} />}>
            Migration in progress... Please wait.
          </Alert>
        )}

        {status === 'success' && results && (
          <Alert severity="success" icon={<CheckCircleIcon />}>
            <Typography variant="subtitle1" gutterBottom>
              Migration completed successfully!
            </Typography>
            {results.products !== undefined && (
              <Typography variant="body2">
                Products migrated: {results.products}
              </Typography>
            )}
            {results.customers !== undefined && (
              <Typography variant="body2">
                Customers migrated: {results.customers}
              </Typography>
            )}
            {results.orders !== undefined && (
              <Typography variant="body2">
                Orders created: {results.orders}
              </Typography>
            )}
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error" icon={<ErrorIcon />}>
            <Typography variant="subtitle1" gutterBottom>
              Migration failed
            </Typography>
            <Typography variant="body2">
              {error || 'An unknown error occurred'}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Please check your Firebase configuration and try again.
            </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Alert severity="warning">
          <Typography variant="subtitle2" gutterBottom>
            Important Notes:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Make sure Firebase is configured in your .env.local file</li>
              <li>This will create new documents in Firestore</li>
              <li>Run this migration only once to avoid duplicates</li>
              <li>After migration, the app will use Firebase for all data operations</li>
            </ul>
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}
