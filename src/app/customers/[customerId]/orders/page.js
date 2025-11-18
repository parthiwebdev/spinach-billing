'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';
import { selectCustomerById } from '../../../../store/slices/customersSlice';
import { selectAllOrders } from '../../../../store/slices/ordersSlice';
import { selectCustomerPayments, initializeCustomerPaymentsListener } from '@/store/slices/paymentsSlice';

export default function CustomerOrders() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const customerId = params.customerId;

  const customer = useSelector(selectCustomerById(customerId));
  const allOrders = useSelector(selectAllOrders);
  const customerPaymentHistory = useSelector(selectCustomerPayments(customerId));

  useEffect(() => {
    if (customerId) {
      dispatch(initializeCustomerPaymentsListener(customerId));
    }
  }, [dispatch, customerId]);

  if (!customer) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Customer not found
          </Typography>
          <Button variant="contained" onClick={() => router.push('/customers')} sx={{ mt: 2 }}>
            Back to Customers
          </Button>
        </Paper>
      </Container>
    );
  }

  // Get orders for this customer
  const customerOrders = customer.orderHistory
    ? allOrders.filter((order) =>
        customer.orderHistory.some((oh) => oh.orderId === order.id)
      )
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Processing':
        return 'info';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, px: { xs: 1, md: 0 } }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => router.push('/customers')}
            sx={{ mr: 2 }}
          >
            Back to Customers
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
              Customer Orders
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Order history for {customer.name}
            </Typography>
          </Box>
        </Box>

        {/* Customer Information Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Customer Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.name}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Contact
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.phone}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {customer.city}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: (customer.pendingBalance || 0) > 0 ? 'error.light' : 'success.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PaymentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Pending Balance
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  ₹{(customer.pendingBalance || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Total Spent: ₹{(customer.totalSpent || 0).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Payment History Section */}
        {customerPaymentHistory && customerPaymentHistory.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Payment History ({customerPaymentHistory.length} payments)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount Paid</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Previous Balance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>New Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerPaymentHistory.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          ₹{payment.amountPaid.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={payment.paymentMethod} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        ₹{(payment.previousBalance || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ₹{(payment.newBalance || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {customerPaymentHistory.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing 5 most recent payments
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Orders Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Order History ({customerOrders.length} orders)
            </Typography>
          </Box>

          {customerOrders.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="info">
                No orders found for this customer.
              </Alert>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 400px)', md: 'calc(100vh - 350px)' } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Items</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerOrders
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(order.date)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2">
                            {order.items.length} items ({order.items.reduce((sum, item) => sum + item.quantity, 0)} units)
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            ₹{order.total.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => router.push(`/orders/${order.id}`)}
                              title="View Order"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => router.push(`/orders/${order.id}/edit`)}
                              title="Edit Order"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
