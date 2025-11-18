'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { createPayment, initializePaymentsListener, selectAllPayments } from '@/store/slices/paymentsSlice';
import { selectAllCustomers, initializeCustomersListener } from '@/store/slices/customersSlice';

export default function PaymentsPage() {
  const dispatch = useDispatch();
  const customers = useSelector(selectAllCustomers);
  const payments = useSelector(selectAllPayments);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize Firebase listeners
    dispatch(initializeCustomersListener());
    dispatch(initializePaymentsListener());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      await dispatch(
        createPayment({
          customerId: selectedCustomer.id,
          amountPaid: parseFloat(amountPaid),
          paymentMethod,
          notes,
        })
      ).unwrap();

      // Reset form
      setSelectedCustomer(null);
      setAmountPaid('');
      setPaymentMethod('Cash');
      setNotes('');
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    }
  };

  const customerPendingBalance = selectedCustomer?.pendingBalance || 0;
  const newBalance = Math.max(0, customerPendingBalance - parseFloat(amountPaid || 0));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Record Payment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record customer payments and update pending balances
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Payment Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PaymentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Payment Details
              </Typography>
            </Box>

            {success && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                Payment recorded successfully!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={customers}
                getOptionLabel={(customer) => `${customer.name} - ${customer.phone}`}
                value={selectedCustomer}
                onChange={(event, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    margin="normal"
                    required
                    fullWidth
                  />
                )}
                renderOption={(props, customer) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{customer.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.phone} | Pending: ₹{(customer.pendingBalance || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />

              {selectedCustomer && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Current Pending Balance:</strong> ₹{customerPendingBalance.toFixed(2)}
                  </Typography>
                </Alert>
              )}

              <TextField
                label="Payment Amount"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                fullWidth
                margin="normal"
                required
                inputProps={{ min: 0, step: 0.01 }}
                helperText={
                  amountPaid && selectedCustomer
                    ? `New balance will be: ₹${newBalance.toFixed(2)}`
                    : ''
                }
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label="Payment Method"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
                startIcon={<PaymentIcon />}
              >
                Record Payment
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Recent Payments
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Balance After</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => {
                    const customer = customers.find((c) => c.id === payment.customerId);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{customer?.name || 'Unknown'}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            ₹{payment.amountPaid.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={payment.paymentMethod} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          ₹{(payment.newBalance || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No payments recorded yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
