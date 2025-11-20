'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Chip,
} from '@mui/material';
import { selectCartTotal, clearCart } from '../../store/slices/cartSlice';
import { createOrderWithBalance } from '../../store/slices/ordersSlice';
import { saveCustomer, selectCustomerByPhone } from '../../store/slices/customersSlice';
import { findCustomerByContact } from '@/services/firebaseService';

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  address: Yup.string().min(10, 'Address must be at least 10 characters').required('Address is required'),
  city: Yup.string().required('City is required'),
  zipCode: Yup.string()
    .matches(/^[0-9]{5}$/, 'ZIP code must be 5 digits')
    .required('ZIP code is required'),
});

// Custom Material-UI TextField for Formik
const FormikTextField = ({ field, form, ...props }) => {
  const { name } = field;
  const { touched, errors } = form;
  const hasError = touched[name] && errors[name];

  return (
    <TextField
      {...field}
      {...props}
      error={Boolean(hasError)}
      helperText={hasError ? errors[name] : ''}
      fullWidth
      margin="normal"
    />
  );
};

export default function Checkout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);
  const subtotal = useSelector(selectCartTotal);
  const isAuthenticated = useSelector((state) => state.auth?.user);

  const [customerPendingBalance, setCustomerPendingBalance] = useState(0);
  const [customerId, setCustomerId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const SHIPPING_FEE = 0; // No shipping fee

  const orderSubtotal = subtotal + SHIPPING_FEE;
  const totalWithPending = orderSubtotal + customerPendingBalance;

  // Check for existing customer when phone number changes
  const handlePhoneChange = async (phone, setFieldValue) => {
    setPhoneNumber(phone);
    if (phone.length === 10) {
      try {
        const formattedPhone = `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
        const existingCustomer = await findCustomerByContact(formattedPhone, '');

        if (existingCustomer) {
          setCustomerPendingBalance(existingCustomer.pendingBalance || 0);
          setCustomerId(existingCustomer.id);

          // Auto-fill form if customer exists
          setFieldValue('name', existingCustomer.name);
          setFieldValue('email', existingCustomer.email);
          setFieldValue('address', existingCustomer.address);
          setFieldValue('city', existingCustomer.city);
          setFieldValue('zipCode', existingCustomer.zipCode);
        } else {
          setCustomerPendingBalance(0);
          setCustomerId(null);
        }
      } catch (error) {
        console.error('Error checking customer:', error);
      }
    } else {
      setCustomerPendingBalance(0);
      setCustomerId(null);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const orderDate = new Date().toISOString();

      // Format phone number to match customer data format (555) 123-4567
      const formattedPhone = `(${values.phone.substring(0, 3)}) ${values.phone.substring(3, 6)}-${values.phone.substring(6)}`;

      const customerData = {
        name: values.name,
        email: values.email,
        phone: formattedPhone,
        address: values.address,
        city: values.city,
        zipCode: values.zipCode,
      };

      // Always save/update customer to get Firebase ID
      console.log('Saving customer...', customerData);
      const savedCustomer = await dispatch(saveCustomer(customerData));
      const finalCustomerId = savedCustomer.id;
      console.log('Customer saved with ID:', finalCustomerId);

      if (!finalCustomerId) {
        throw new Error('Failed to get customer ID');
      }

      // Create order with pending balance
      const orderData = {
        orderNumber: `ORD-${Date.now()}`,
        date: orderDate,
        customerInfo: customerData,
        items: cartItems,
        subtotal: orderSubtotal,
        shipping: SHIPPING_FEE,
        total: orderSubtotal,
      };

      console.log('Creating order...', orderData);
      const order = await dispatch(
        createOrderWithBalance(orderData, finalCustomerId, customerPendingBalance)
      );
      console.log('Order created:', order);

      // Clear cart
      dispatch(clearCart());

      // Redirect to orders page
      setTimeout(() => {
        setSubmitting(false);
        router.push('/orders');
      }, 1000);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error.message}`);
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add some products to your cart before checking out.
          </Typography>
          <Button variant="contained" onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Checkout
        </Typography>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You are checking out as a guest. Register or login to track your orders.
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Customer Information Form */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Delivery Information
              </Typography>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  zipCode: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, setFieldValue, values }) => (
                  <Form>
                    <Field name="name" component={FormikTextField} label="Full Name" />
                    <Field name="email" component={FormikTextField} label="Email" type="email" />
                    <Field
                      name="phone"
                      component={FormikTextField}
                      label="Phone Number"
                      onChange={(e) => {
                        setFieldValue('phone', e.target.value);
                        handlePhoneChange(e.target.value, setFieldValue);
                      }}
                    />
                    {customerId && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Existing customer found! Form auto-filled with saved information.
                        {customerPendingBalance > 0 && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Previous Pending Balance: ₹{customerPendingBalance.toFixed(2)}</strong>
                          </Typography>
                        )}
                      </Alert>
                    )}
                    <Field
                      name="address"
                      component={FormikTextField}
                      label="Delivery Address"
                      multiline
                      rows={2}
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
                        <Field name="city" component={FormikTextField} label="City" />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Field name="zipCode" component={FormikTextField} label="ZIP Code" />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Order Summary
              </Typography>

              <List sx={{ mb: 2 }}>
                {cartItems.map((item) => (
                  <ListItem key={item.productId} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={item.image} alt={item.name} variant="rounded" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.quantity} × ₹${item.price.toFixed(2)}`}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">₹{subtotal.toFixed(2)}</Typography>
              </Box>

              {SHIPPING_FEE > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1">₹{SHIPPING_FEE.toFixed(2)}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Order Total
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{orderSubtotal.toFixed(2)}
                </Typography>
              </Box>

              {customerPendingBalance > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" color="error">
                      Previous Pending Balance
                    </Typography>
                    <Typography variant="body1" color="error">
                      ₹{customerPendingBalance.toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total Amount Due
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                  ₹{totalWithPending.toFixed(2)}
                </Typography>
              </Box>

              {customerPendingBalance > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This includes previous pending balance of ₹{customerPendingBalance.toFixed(2)}
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
