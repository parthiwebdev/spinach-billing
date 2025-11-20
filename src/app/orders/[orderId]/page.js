'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { ArrowBack as BackIcon, CheckCircle as CheckIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { selectOrderById, selectLatestOrder, deleteOrder } from '../../../store/slices/ordersSlice';

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const orderId = params.orderId;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Get both orders unconditionally (hooks must be called in the same order every render)
  const latestOrder = useSelector(selectLatestOrder);
  const specificOrder = useSelector(selectOrderById(orderId));

  // Choose which order to display
  const order = orderId === 'latest' ? latestOrder : specificOrder;

  if (!order) {
    // Don't show "not found" if we're deleting (redirect is in progress)
    if (isDeleting) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Order deleted successfully
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to orders list...
            </Typography>
          </Paper>
        </Container>
      );
    }

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Order not found
          </Typography>
          <Button variant="contained" onClick={() => router.push('/orders')} sx={{ mt: 2 }}>
            View All Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteDialogOpen(false);
    try {
      await dispatch(deleteOrder(order.id));
      // Redirect immediately to orders list
      router.push('/orders');
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
      setIsDeleting(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<BackIcon />}
          onClick={() => router.push('/orders')}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>

        {/* Success Alert for new orders */}
        {orderId === 'latest' && (
          <Alert
            severity="success"
            icon={<CheckIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" gutterBottom>
              Order placed successfully!
            </Typography>
            <Typography variant="body2">
              We've received your order and will process it shortly. You'll receive a confirmation email at{' '}
              {order.customerInfo.email}
            </Typography>
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          {/* Order Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Order Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Order #{order.orderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placed on {formatDate(order.date)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Delivery Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {order?.customerInfo?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerInfo.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerInfo.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {order.customerInfo.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerInfo.city}, {order.customerInfo.zipCode}
                </Typography>
              </Box>
            </Grid>

            {/* Order Summary */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{order.subtotal.toFixed(2)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    ₹{order.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Order Items */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Items Ordered
          </Typography>
          <List>
            {order.items.map((item) => (
              <ListItem key={item.productId} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </Typography>
                  }
                />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{(item.quantity * item.price).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete Order
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => router.push('/products')}>
                Continue Shopping
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/orders/${order.id}/edit`)}
              >
                Edit Order
              </Button>
              <Button variant="contained" onClick={() => router.push('/orders')}>
                View All Orders
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete order <strong>#{order.orderNumber}</strong>?
              <br /><br />
              This will:
              <br />• Remove the order from the system
              <br />• Update customer's pending balance
              <br />• Delete related payment records
              <br /><br />
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Order'}
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
