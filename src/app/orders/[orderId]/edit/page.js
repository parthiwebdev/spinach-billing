'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
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
  Save as SaveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { selectOrderById, modifyOrder, selectOrdersLoading } from '../../../../store/slices/ordersSlice';
import { spinachProducts } from '../../../../data/spinachProducts';

export default function EditOrder() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId;

  const order = useSelector(selectOrderById(orderId));
  const loading = useSelector(selectOrdersLoading);
  const [productQuantities, setProductQuantities] = useState({});

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
          <Button variant="contained" onClick={() => router.push('/orders')} sx={{ mt: 2 }}>
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
  const total = subtotal + SHIPPING_FEE;

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
  const handleUpdateOrder = async () => {
    if (orderItems.length === 0) return;

    try {
      // Update order in Firebase
      await dispatch(
        modifyOrder(order.id, {
          items: orderItems,
          subtotal,
          shipping: SHIPPING_FEE,
          total,
        })
      );

      // Navigate back to order detail
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: { xs: 1, md: 0 } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push(`/orders/${order.id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <SaveIcon sx={{ fontSize: { xs: 32, md: 40 }, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
              Edit Order
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order #{order.orderNumber}
            </Typography>
          </Box>
        </Box>

        {/* Customer Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Customer Information
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {order?.customerInfo?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.customerInfo?.phone?.replace(/^\(\d{3}\)\s/, '') || 'No phone'} • {order.customerInfo?.city || 'No city'}
            </Typography>
            {order.customerInfo?.address && (
              <Typography variant="body2" color="text.secondary">
                {order.customerInfo.address}
              </Typography>
            )}
          </Box>
        </Paper>

        <div className='row'>
          <div className="col-md-8 col-12">
            {/* Products Table */}
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Edit Products
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
                  Updated Order Summary
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {orderItems.length > 0 ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    {orderItems.map((item, index) => (
                      <Box
                        key={index}
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
                disabled={loading || orderItems.length === 0}
                startIcon={<SaveIcon />}
              >
                {loading ? 'Saving...' : 'Save Changes'}
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
          </div>
        </div>
      </Container>
    </Box>
  );
}
