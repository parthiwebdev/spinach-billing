'use client';

import { useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, CheckCircle as CheckIcon, Edit as EditIcon } from '@mui/icons-material';
import { selectOrderById, selectLatestOrder } from '../../../store/slices/ordersSlice';

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  // Get both orders unconditionally (hooks must be called in the same order every render)
  const latestOrder = useSelector(selectLatestOrder);
  const specificOrder = useSelector(selectOrderById(orderId));

  // Choose which order to display
  const order = orderId === 'latest' ? latestOrder : specificOrder;

  if (!order) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'info';
      case 'Shipped':
        return 'primary';
      case 'Delivered':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
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
              <Chip label={order.status} color={getStatusColor(order.status)} />
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">₹{order.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">₹{(order.shipping || 0).toFixed(2)}</Typography>
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
                      {item.quantity} × ₹{item.price.toFixed(2)} per {item.unit}
                    </Typography>
                  }
                />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{(item.quantity * item.price).toFixed(2)}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
        </Paper>
      </Container>
    </Box>
  );
}
