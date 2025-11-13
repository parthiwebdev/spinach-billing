import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Autocomplete,
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
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { selectAllCustomers, addOrUpdateCustomer } from '../store/slices/customersSlice';
import { createOrder } from '../store/slices/ordersSlice';
import { spinachProducts } from '../data/spinachProducts';

const CreateOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customers = useSelector(selectAllCustomers);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});

  const TAX_RATE = 0.1; // 10% tax
  const SHIPPING_FEE = 5.99;

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

  // Create order
  const handleCreateOrder = () => {
    if (!selectedCustomer || orderItems.length === 0) return;

    const orderDate = new Date().toISOString();
    const orderId = Date.now().toString();

    // Create order
    dispatch(
      createOrder({
        customerInfo: {
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          zipCode: selectedCustomer.zipCode,
        },
        items: orderItems,
        subtotal,
        tax,
        shipping: SHIPPING_FEE,
        total,
      })
    );

    // Update customer with order information
    dispatch(
      addOrUpdateCustomer({
        customerInfo: {
          name: selectedCustomer.name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          address: selectedCustomer.address,
          city: selectedCustomer.city,
          zipCode: selectedCustomer.zipCode,
        },
        orderId,
        orderTotal: total,
        orderDate,
      })
    );

    // Navigate to order detail
    navigate('/orders/latest');
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <ReceiptIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: 'primary.main' }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
            Create Order
          </Typography>
        </Box>

        {customers.length === 0 && (
          <Alert severity="warning" sx={{ mb: { xs: 2, md: 3 }, mx: { xs: 1, md: 0 } }}>
            No customers found. Complete a checkout first to add customers to the system.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Customer & Products */}
          <Grid item xs={12} md={8}>
            {/* Customer Selection */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Select Customer
              </Typography>
              <Autocomplete
                value={selectedCustomer}
                onChange={(event, newValue) => setSelectedCustomer(newValue)}
                options={customers}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.phone.replace(/^\(\d{3}\)\s/, '')}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer"
                    placeholder="Search by name or phone"
                  />
                )}
                fullWidth
              />

              {selectedCustomer && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedCustomer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer.phone.replace(/^\(\d{3}\)\s/, '')} • {selectedCustomer.city}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Orders: {selectedCustomer.totalOrders} | Total Spent: ₹
                    {selectedCustomer.totalSpent.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Products Grid */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Add Products to Order
              </Typography>
              <div className='row'>
                {spinachProducts.map((product, index) => {
                  const qty = productQuantities[product.id] || 0;
                  const itemTotal = product.price * qty;
                  return (
                    <div
                      key={index}
                      className='col-lg-2 col-md-3 col-6 mb-3'
                    >
                      <Card
                        sx={{
                          height: 350,
                          display: 'flex',
                          flexDirection: 'column',
                          border: qty > 0 ? 2 : 1,
                          borderColor: qty > 0 ? 'primary.main' : 'divider',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        {qty > 0 && (
                          <Chip
                            label={`${qty} added`}
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
                          height="140"
                          image={product.image}
                          alt={product.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1, pb: 1, p: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 600, fontSize: '1.25rem' }}>
                            ₹{product.price.toFixed(2)}
                          </Typography>

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
                    </div>
                  );
                })}
              </div>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Summary
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No items added yet
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCreateOrder}
                disabled={!selectedCustomer || orderItems.length === 0}
                startIcon={<ReceiptIcon />}
              >
                Create Order & Generate Bill
              </Button>

              {(!selectedCustomer || orderItems.length === 0) && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 2, textAlign: 'center' }}
                >
                  {!selectedCustomer
                    ? 'Please select a customer'
                    : 'Please add at least one product'}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CreateOrder;
