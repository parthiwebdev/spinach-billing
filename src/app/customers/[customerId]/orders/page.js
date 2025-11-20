'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
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
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { selectCustomerById } from '../../../../store/slices/customersSlice';
import { selectCustomerPayments, initializeCustomerPaymentsListener, createPayment } from '@/store/slices/paymentsSlice';

export default function CustomerDetails() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams();
  const customerId = params.customerId;

  const customer = useSelector(selectCustomerById(customerId));
  const customerPaymentHistory = useSelector(selectCustomerPayments(customerId));

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (customerId) {
      dispatch(initializeCustomerPaymentsListener(customerId));
    }
  }, [dispatch, customerId]);

  // Payment handlers
  const handleOpenPaymentDialog = () => {
    setPaymentDialogOpen(true);
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentNotes('');
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setPaymentAmount('');
    setPaymentMethod('Cash');
    setPaymentNotes('');
  };

  const handlePaymentSubmit = async () => {
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid payment amount',
        severity: 'error'
      });
      return;
    }

    setIsProcessing(true);
    try {
      await dispatch(createPayment({
        customerId,
        amountPaid: amount,
        paymentMethod,
        notes: paymentNotes || `Payment received via ${paymentMethod}`
      }));

      setSnackbar({
        open: true,
        message: `Payment of ₹${amount.toFixed(2)} recorded successfully`,
        severity: 'success'
      });
      handleClosePaymentDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error recording payment: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
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
              Customer Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {customer.name}
            </Typography>
          </Box>
        </Box>

        {/* Customer Information Cards */}
        <div className="row mb-sm-4 mb-3">
          <div className="col-md-9 col-sm-8 col-12">
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
                {customer.address && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {customer.address}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </div>
          <div className="col-md-3 col-sm-4 col-12 mt-sm-0 mt-3">
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
                {(customer.pendingBalance || 0) > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenPaymentDialog}
                    sx={{
                      mt: 2,
                      bgcolor: 'white',
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                    fullWidth
                  >
                    Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Payment History Section */}
        {customerPaymentHistory && customerPaymentHistory.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Transaction History ({customerPaymentHistory.length} entries)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date / Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Previous Balance</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>New Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerPaymentHistory.slice(0, 10).map((payment) => {
                    const isOrder = payment.type === 'order' || payment.amountPaid < 0;
                    const amount = Math.abs(payment.amountPaid);
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Typography>
                          <Chip
                            label={isOrder ? 'Order' : payment.paymentMethod}
                            size="small"
                            color={isOrder ? 'warning' : 'success'}
                            variant={isOrder ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            color={isOrder ? 'error.main' : 'success.main'}
                            sx={{ fontWeight: 600 }}
                          >
                            {isOrder ? '+' : '-'}₹{amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          ₹{(payment.previousBalance || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ₹{(payment.newBalance || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {customerPaymentHistory.length > 10 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing 10 most recent transactions
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer: <strong>{customer.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Pending Balance: <strong>₹{(customer.pendingBalance || 0).toFixed(2)}</strong>
              </Typography>

              <TextField
                autoFocus
                margin="dense"
                label="Payment Amount"
                type="number"
                fullWidth
                variant="outlined"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mb: 2 }}
              />

              <TextField
                select
                margin="dense"
                label="Payment Method"
                fullWidth
                variant="outlined"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField
                margin="dense"
                label="Notes (Optional)"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Add any notes about this payment..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handlePaymentSubmit}
              disabled={isProcessing || !paymentAmount}
            >
              {isProcessing ? 'Processing...' : 'Record Payment'}
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
