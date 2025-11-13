'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Autocomplete,
  Divider,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { selectAllCustomers, addOrUpdateCustomer } from '../../store/slices/customersSlice';
import { createOrder } from '../../store/slices/ordersSlice';
import { spinachProducts } from '../../data/spinachProducts';

export default function CreateOrder() {
  const dispatch = useDispatch();
  const router = useRouter();
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
    router.push('/orders/latest');
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

        {/* Left Column - Customer & Products */}
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

        <div className='row'>
          <div className="col-md-8 col-12">
            {/* Products Table */}
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Add Products to Order
                </Typography>
              </Box>
              <TableContainer sx={{ overflowX: 'visible' }}>
                <Table sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          width: { xs: '50%', sm: '40%' }
                        }}
                      >
                        Product Name
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          display: { xs: 'none', sm: 'table-cell' },
                          width: '15%'
                        }}
                      >
                        Price
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          width: { xs: '50%', sm: '30%' }
                        }}
                      >
                        Quantity
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          display: { xs: 'none', sm: 'table-cell' },
                          width: '15%'
                        }}
                      >
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {spinachProducts.map((product) => {
                      const qty = productQuantities[product.id] || 0;
                      const itemTotal = product.price * qty;
                      return (
                        <TableRow
                          key={product.id}
                          sx={{
                            bgcolor: qty > 0 ? 'action.selected' : 'inherit',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <TableCell sx={{ py: { xs: 1, md: 2 } }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: qty > 0 ? 600 : 400,
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: { xs: 'block', sm: 'none' },
                                fontSize: '0.7rem'
                              }}
                            >
                              ₹{product.price.toFixed(2)}
                              {qty > 0 && ` • Total: ₹${itemTotal.toFixed(2)}`}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                              py: { xs: 1, md: 2 }
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                              }}
                            >
                              ₹{product.price.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: { xs: 1, md: 2 } }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: { xs: 0.5, md: 1 },
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(product.id, -1)}
                                disabled={qty === 0}
                                sx={{
                                  bgcolor: 'action.hover',
                                  width: { xs: 28, md: 32 },
                                  height: { xs: 28, md: 32 }
                                }}
                              >
                                <RemoveIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                              </IconButton>
                              <TextField
                                value={qty}
                                onChange={(e) => handleQuantityInput(product.id, e.target.value)}
                                type="number"
                                slotProps={{
                                  input: {
                                    inputProps: {
                                      min: 0,
                                      style: {
                                        textAlign: 'center',
                                        padding: '6px',
                                        fontSize: '0.875rem'
                                      },
                                    },
                                  },
                                }}
                                sx={{ width: { xs: 50, md: 70 } }}
                                size="small"
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(product.id, 1)}
                                sx={{
                                  bgcolor: 'action.hover',
                                  width: { xs: 28, md: 32 },
                                  height: { xs: 28, md: 32 }
                                }}
                              >
                                <AddIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              display: { xs: 'none', sm: 'table-cell' },
                              py: { xs: 1, md: 2 }
                            }}
                          >
                            {qty > 0 ? (
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                                }}
                              >
                                ₹{itemTotal.toFixed(2)}
                              </Typography>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>
          <div className="col-md-4 col-12 mt-md-0 mt-3">
            {/* Right Column - Order Summary */}
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
          </div>
        </div>
      </Container>
    </Box>
  );
}
