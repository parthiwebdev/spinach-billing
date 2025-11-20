'use client';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { selectAllProducts } from '@/store/slices/productsSlice';
import { bulkUpdateProductPrices } from '@/services/firebaseService';

export default function Products() {
  const products = useSelector(selectAllProducts);
  const [editedPrices, setEditedPrices] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initialize edited prices when products load
  useEffect(() => {
    if (products.length > 0 && Object.keys(editedPrices).length === 0) {
      const initialPrices = {};
      products.forEach(product => {
        initialPrices[product.id] = product.price;
      });
      setEditedPrices(initialPrices);
    }
  }, [products, editedPrices]);

  const handlePriceChange = (productId, newPrice) => {
    // Allow empty string temporarily for typing, but enforce minimum on blur
    if (newPrice === '') {
      setEditedPrices(prev => ({
        ...prev,
        [productId]: ''
      }));
      return;
    }

    const parsedPrice = parseFloat(newPrice);

    // If user enters 0 or negative, set to 1
    const finalPrice = isNaN(parsedPrice) || parsedPrice <= 0 ? 1 : parsedPrice;

    setEditedPrices(prev => ({
      ...prev,
      [productId]: finalPrice
    }));
  };

  const handlePriceBlur = (productId, product) => {
    // On blur, if empty or invalid, reset to original or 1
    const currentPrice = editedPrices[productId];
    if (currentPrice === '' || currentPrice === null || currentPrice === undefined) {
      setEditedPrices(prev => ({
        ...prev,
        [productId]: product.price || 1
      }));
    } else if (currentPrice <= 0) {
      setEditedPrices(prev => ({
        ...prev,
        [productId]: 1
      }));
    }
  };

  const hasChanges = () => {
    return products.some(product =>
      editedPrices[product.id] !== undefined &&
      editedPrices[product.id] !== product.price
    );
  };

  const handleSave = async () => {
    const updates = products
      .filter(product => editedPrices[product.id] !== product.price)
      .map(product => ({
        id: product.id,
        price: editedPrices[product.id]
      }));

    if (updates.length === 0) {
      setSnackbar({
        open: true,
        message: 'No changes to save',
        severity: 'info'
      });
      return;
    }

    setIsSaving(true);
    try {
      await bulkUpdateProductPrices(updates);
      setSnackbar({
        open: true,
        message: `Successfully updated ${updates.length} product price(s)`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error updating prices: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
              Products
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
              Vegetables products list with prices
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isSaving || !hasChanges()}
            sx={{ height: 'fit-content' }}
          >
            {isSaving ? 'Saving...' : 'Save Prices'}
          </Button>
        </Box>

        {/* Products Table */}
        <TableContainer component={Paper}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '60%',
                    textAlign: { xs: 'left', md: 'center' }
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '40%',
                    textAlign: { xs: 'right', md: 'center' }
                  }}
                >
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, textAlign: { xs: 'right', md: 'center' } }}>
                      <TextField
                        type="number"
                        value={editedPrices[product.id] !== undefined ? editedPrices[product.id] : product.price}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        onBlur={() => handlePriceBlur(product.id, product)}
                        size="small"
                        inputProps={{ min: 1, step: 0.01 }}
                        sx={{
                          width: { xs: '80px', md: '100px' },
                          '& input': {
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Count */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
