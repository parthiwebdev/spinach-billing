'use client';

import { useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { selectAllProducts } from '@/store/slices/productsSlice';
import { bulkUpdateProductPrices, createProduct, deleteProduct } from '@/services/firebaseService';

export default function Products() {
  const products = useSelector(selectAllProducts);
  const [editedPrices, setEditedPrices] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add product dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const productNameInputRef = useRef(null);

  // Delete product dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

  const hasChanges = () => {
    return products.some(product =>
      editedPrices[product.id] !== undefined &&
      editedPrices[product.id] !== product.price
    );
  };

  const handleSave = async () => {
    const updates = products
      .filter(product => {
        const editedPrice = editedPrices[product.id];
        // Only include products with valid numeric prices that differ from original
        return editedPrice !== undefined &&
               editedPrice !== '' &&
               editedPrice !== null &&
               typeof editedPrice === 'number' &&
               editedPrice !== product.price;
      })
      .map(product => ({
        id: product.id,
        price: parseFloat(editedPrices[product.id])
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

  // Add product handlers
  const handleAddClick = () => {
    setAddDialogOpen(true);
    setNewProduct({ name: '', price: '' });
  };

  const handleAddCancel = () => {
    setAddDialogOpen(false);
    setNewProduct({ name: '', price: '' });
  };

  // Handle dialog transition end to focus input
  const handleDialogEntered = () => {
    // Use setTimeout to ensure the dialog is fully rendered
    setTimeout(() => {
      if (productNameInputRef.current) {
        productNameInputRef.current.focus();
      }
    }, 50);
  };

  const handleAddSubmit = async () => {
    if (!newProduct.name || !newProduct.price) {
      setSnackbar({
        open: true,
        message: 'Name and price are required',
        severity: 'error'
      });
      return;
    }

    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      setSnackbar({
        open: true,
        message: 'Price must be a valid number greater than 0',
        severity: 'error'
      });
      return;
    }

    setIsAdding(true);
    try {
      await createProduct({
        name: newProduct.name.trim(),
        price: price,
        category: 'Vegetables',
        description: '',
        inStock: true
      });

      setSnackbar({
        open: true,
        message: `Product "${newProduct.name}" added successfully!`,
        severity: 'success'
      });
      handleAddCancel();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error adding product: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Delete product handlers
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setSnackbar({
        open: true,
        message: `Product "${productToDelete.name}" deleted successfully!`,
        severity: 'success'
      });
      handleDeleteCancel();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error deleting product: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              sx={{ height: 'fit-content' }}
            >
              Add Product
            </Button>
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
        </Box>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          {searchQuery && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Found {filteredProducts.length} of {products.length} products
              </Typography>
              <Button size="small" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </Box>
          )}
        </Paper>

        {/* Products Table */}
        <TableContainer component={Paper}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '50%',
                    textAlign: { xs: 'left', md: 'center' }
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '30%',
                    textAlign: { xs: 'right', md: 'center' }
                  }}
                >
                  Price
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '20%',
                    textAlign: 'center'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                    <TableCell sx={{ textAlign: 'center' }}>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(product)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery ? `No products found matching "${searchQuery}"` : 'No products found'}
                    </Typography>
                    {searchQuery && (
                      <Button size="small" onClick={() => setSearchQuery('')} sx={{ mt: 1 }}>
                        Clear Search
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Count */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? `Showing ${filteredProducts.length} of ${products.length} product${products.length !== 1 ? 's' : ''}`
              : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`
            }
          </Typography>
        </Box>

        {/* Add Product Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={handleAddCancel}
          maxWidth="sm"
          fullWidth
          TransitionProps={{
            onEntered: handleDialogEntered
          }}
        >
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                inputRef={productNameInputRef}
                fullWidth
                required
              />
              <TextField
                label="Price"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                fullWidth
                required
                inputProps={{ min: 0.01, step: 0.01 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddCancel} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSubmit}
              variant="contained"
              disabled={isAdding || !newProduct.name || !newProduct.price}
            >
              {isAdding ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

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
