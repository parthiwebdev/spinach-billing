// Payments Slice - Redux state management for payment transactions
import { createSlice } from '@reduxjs/toolkit';
import {
  recordPayment,
  subscribeToPayments,
  subscribeToCustomerPayments
} from '@/services/firebaseService';

// Store listeners outside of Redux state (not serializable)
let paymentsListener = null;
const customerPaymentsListeners = {};

const initialState = {
  payments: [],
  customerPayments: {}, // Keyed by customerId for efficient lookup
  loading: false,
  error: null
};

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    // Set all payments (from Firebase listener)
    setPayments: (state, action) => {
      state.payments = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set customer-specific payments (from Firebase listener)
    setCustomerPayments: (state, action) => {
      const { customerId, payments } = action.payload;
      state.customerPayments[customerId] = payments;
    },

    // Add a new payment to local state (optimistic update)
    addPayment: (state, action) => {
      state.payments.unshift(action.payload);
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setPayments,
  setCustomerPayments,
  addPayment,
  setLoading,
  setError,
  clearError
} = paymentsSlice.actions;

// ==================== ASYNC THUNKS ====================

/**
 * Initialize real-time listener for all payments
 */
export const initializePaymentsListener = () => (dispatch) => {
  // Don't create duplicate listeners
  if (paymentsListener) {
    return;
  }

  try {
    paymentsListener = subscribeToPayments((payments) => {
      dispatch(setPayments(payments));
    });
  } catch (error) {
    console.error('Error initializing payments listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Initialize real-time listener for customer's payment history
 */
export const initializeCustomerPaymentsListener = (customerId) => (dispatch) => {
  // Don't create duplicate listeners
  if (customerPaymentsListeners[customerId]) {
    return;
  }

  try {
    customerPaymentsListeners[customerId] = subscribeToCustomerPayments(customerId, (payments) => {
      dispatch(setCustomerPayments({ customerId, payments }));
    });
  } catch (error) {
    console.error('Error initializing customer payments listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Record a new payment
 */
export const createPayment = (paymentData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const payment = await recordPayment(paymentData);

    // Optimistically add to local state (will be updated by listener)
    dispatch(addPayment(payment));

    dispatch(setLoading(false));
    return payment;
  } catch (error) {
    console.error('Error creating payment:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Cleanup all payment listeners (call on app unmount)
 */
export const cleanupPaymentsListeners = () => () => {
  if (paymentsListener) {
    paymentsListener();
    paymentsListener = null;
  }
  Object.values(customerPaymentsListeners).forEach(unsubscribe => {
    if (unsubscribe) unsubscribe();
  });
  Object.keys(customerPaymentsListeners).forEach(key => {
    delete customerPaymentsListeners[key];
  });
};

// ==================== SELECTORS ====================

// Get all payments
export const selectAllPayments = (state) => state.payments.payments;

// Get payments for a specific customer
export const selectCustomerPayments = (customerId) => (state) => {
  return state.payments.customerPayments[customerId] || [];
};

// Get payment by ID
export const selectPaymentById = (paymentId) => (state) => {
  return state.payments.payments.find(payment => payment.id === paymentId);
};

// Get recent payments (last N)
export const selectRecentPayments = (limit = 10) => (state) => {
  return state.payments.payments.slice(0, limit);
};

// Get total payments for a customer
export const selectCustomerTotalPaid = (customerId) => (state) => {
  const payments = state.payments.customerPayments[customerId] || [];
  return payments.reduce((total, payment) => total + (payment.amountPaid || 0), 0);
};

// Get payments by date range
export const selectPaymentsByDateRange = (startDate, endDate) => (state) => {
  return state.payments.payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate >= startDate && paymentDate <= endDate;
  });
};

// Get loading state
export const selectPaymentsLoading = (state) => state.payments.loading;

// Get error state
export const selectPaymentsError = (state) => state.payments.error;

// Get total revenue (all payments)
export const selectTotalRevenue = (state) => {
  return state.payments.payments.reduce((total, payment) => {
    return total + (payment.amountPaid || 0);
  }, 0);
};

// Get payments count
export const selectPaymentsCount = (state) => state.payments.payments.length;

// Get today's payments
export const selectTodaysPayments = (state) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return state.payments.payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    paymentDate.setHours(0, 0, 0, 0);
    return paymentDate.getTime() === today.getTime();
  });
};

// Get today's total revenue
export const selectTodaysRevenue = (state) => {
  const todaysPayments = selectTodaysPayments(state);
  return todaysPayments.reduce((total, payment) => {
    return total + (payment.amountPaid || 0);
  }, 0);
};

export default paymentsSlice.reducer;
