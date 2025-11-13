import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { selectOrderById } from '../store/slices/ordersSlice';
import { updateOrder } from '../store/slices/ordersSlice';
import { addOrUpdateCustomer } from '../store/slices/customersSlice';
import { spinachProducts } from '../data/spinachProducts';

const EditOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const order = useSelector(selectOrderById(orderId));
  const [productQuantities, setProductQuantities] = useState({});

  const TAX_RATE = 0.1; // 10% tax
  const SHIPPING_FEE = 5.99;

  // Initialize quantities from existing order
  useEffect(() => {
    if (order) {
      const quantities = {};
      order.items.forEach((item) => {
        quantities[item.productId] = item.quantity;
      });
      setProductQuantities(quantities);
    }
  }, [order]);

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Order not found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
            View All Orders
          </Button>
        </Paper>
      </Container>
    );
  }

  // Get order items from product quantities
  const orderItems = spinachProducts
    .filter((product) => productQuantities[product.id] > 0)
    .map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: productQuantities[product.id],
      image: product.image,
    }));

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + SHIPPING_FEE;

  // Handle quantity change
  const handleQuantityChange = (productId, change) => {
    setProductQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + change);
      return { ...prev, [productId]: newQty };
    });
  };

  // Handle direct input
  const handleQuantityInput = (productId, value) => {
    const qty = parseInt(value) || 0;
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, qty),
    }));
  };

  // Update order
  const handleUpdateOrder = () => {
    if (orderItems.length === 0) return;

    // Update order
    dispatch(
      updateOrder({
        orderId: order.id,
        items: orderItems,
        subtotal,
        tax,
        shipping: SHIPPING_FEE,
        total,
      })
    );

    // Update customer's total spent (recalculate)
    const orderDate = order.date;
    const originalTotal = order.total;
    const difference = total - originalTotal;

    dispatch(
      addOrUpdateCustomer({
        customerInfo: order.customerInfo,
        orderId: order.id,
        orderTotal: difference, // This will be added to existing total
        orderDate,
      })
    );

    // Navigate back to order detail
    navigate(`/orders/${order.id}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: { xs: 1, md: 0 } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(`/orders/${order.id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <SaveIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
              Edit Order
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order #{order.orderNumber}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column - Customer Info & Products */}
          <Grid item xs={12} md={8}>
            {/* Customer Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Customer Information
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {order.customerInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerInfo.phone.replace(/^\(\d{3}\)\s/, '')} • {order.customerInfo.city}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customerInfo.address}
                </Typography>
              </Box>
            </Paper>

            {/* Products Grid */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Edit Products
              </Typography>
              <Grid container spacing={2}>
                {spinachProducts.map((product) => {
                  const qty = productQuantities[product.id] || 0;
                  const itemTotal = product.price * qty;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: qty > 0 ? 2 : 1,
                          borderColor: qty > 0 ? 'primary.main' : 'divider',
                          position: 'relative',
                        }}
                      >
                        {qty > 0 && (
                          <Chip
                            label={`${qty} in order`}
                            color="primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              zIndex: 1,
                            }}
                          />
                        )}
                        <CardMedia
                          component="img"
                          height="120"
                          image={product.image}
                          alt={product.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            ₹{product.price.toFixed(2)} per {product.unit}
                          </Typography>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{ mb: 1 }}
                            color={
                              product.category === 'Fresh'
                                ? 'success'
                                : product.category === 'Frozen'
                                ? 'info'
                                : 'secondary'
                            }
                          />

                          {qty > 0 && (
                            <Typography variant="caption" color="primary" sx={{ display: 'block', fontWeight: 600 }}>
                              Subtotal: ₹{itemTotal.toFixed(2)}
                            </Typography>
                          )}
                        </CardContent>
                        <Box
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            borderTop: 1,
                            borderColor: 'divider',
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={qty === 0}
                            sx={{ bgcolor: 'action.hover' }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            value={qty}
                            onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                            type="number"
                            inputProps={{
                              min: 0,
                              style: { textAlign: 'center', padding: '6px' },
                            }}
                            sx={{ width: 60 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            sx={{ bgcolor: 'action.hover' }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Updated Order Summary
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {orderItems.length > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    {orderItems.map((item) => (
                      <Box
                        key={item.productId}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                          pb: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity} × ₹{item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Items ({orderItems.length})</Typography>
                    <Typography variant="body2">
                      {orderItems.reduce((sum, item) => sum + item.quantity, 0)} units
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">₹{subtotal.toFixed(2)}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Tax (10%)</Typography>
                    <Typography variant="body1">₹{tax.toFixed(2)}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Shipping</Typography>
                    <Typography variant="body1">₹{SHIPPING_FEE.toFixed(2)}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Previous Total
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{order.total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      New Total
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>

                  {total !== order.total && (
                    <Alert severity={total > order.total ? 'info' : 'success'} sx={{ mb: 2 }}>
                      {total > order.total ? '+' : ''}₹
                      {(total - order.total).toFixed(2)} change
                    </Alert>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No items in order
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleUpdateOrder}
                disabled={orderItems.length === 0}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>

              {orderItems.length === 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 2, textAlign: 'center' }}
                >
                  Please add at least one product
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EditOrder;
