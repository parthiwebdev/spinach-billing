import { createSlice } from '@reduxjs/toolkit';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  findCustomerByContact,
  subscribeToCustomers
} from '@/services/firebaseService';

// Store listener outside of Redux state (not serializable)
let customersListener = null;

const initialState = {
  customers: [], // Start with empty array - only show Firebase data
  loading: false,
  error: null,
  synced: false // Track if data is synced with Firebase
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    // Set all customers (from Firebase listener)
    setCustomers: (state, action) => {
      state.customers = action.payload;
      state.synced = true;
      state.loading = false;
      state.error = null;
    },

    // Add new customer to local state (optimistic update)
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
    },

    // Update existing customer in local state
    updateCustomerLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const customer = state.customers.find(c => c.id === id);
      if (customer) {
        Object.assign(customer, updates);
      }
    },

    // Remove customer from local state
    removeCustomerLocal: (state, action) => {
      const customerId = action.payload;
      state.customers = state.customers.filter(c => c.id !== customerId);
    },

    // Legacy reducer for backward compatibility (now triggers Firebase sync)
    addOrUpdateCustomer: (state, action) => {
      const { customerInfo, orderId, orderTotal, orderDate } = action.payload;

      // Normalize phone number for comparison (remove formatting)
      const normalizePhone = (phone) => (phone || '').replace(/\D/g, '');
      const normalizedInputPhone = normalizePhone(customerInfo.phone);

      // Find existing customer by phone or email
      const existingCustomer = state.customers.find(
        (customer) => {
          const phoneMatch = normalizePhone(customer.phone) === normalizedInputPhone;
          const emailMatch = customer.email && customerInfo.email &&
            customer.email.toLowerCase() === customerInfo.email.toLowerCase();
          return phoneMatch || emailMatch;
        }
      );

      if (existingCustomer) {
        // Update existing customer
        existingCustomer.totalOrders += 1;
        existingCustomer.totalSpent += orderTotal;
        existingCustomer.status = 'Active';

        // Add order to customer's order history
        if (!existingCustomer.orderHistory) {
          existingCustomer.orderHistory = [];
        }
        existingCustomer.orderHistory.unshift({
          orderId,
          date: orderDate,
          total: orderTotal,
        });
      } else {
        // Create new customer
        const newCustomer = {
          id: Date.now(),
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode,
          totalOrders: 1,
          totalSpent: orderTotal,
          status: 'Active',
          joinedDate: orderDate,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          orderHistory: [
            {
              orderId,
              date: orderDate,
              total: orderTotal,
            },
          ],
        };

        state.customers.unshift(newCustomer);
      }
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
  },
});

export const {
  addOrUpdateCustomer,
  setCustomers,
  addCustomer,
  updateCustomerLocal,
  removeCustomerLocal,
  setLoading,
  setError,
  clearError
} = customersSlice.actions;

// ==================== ASYNC THUNKS ====================

/**
 * Initialize real-time listener for customers
 */
export const initializeCustomersListener = () => (dispatch) => {
  // Don't create duplicate listeners
  if (customersListener) {
    return;
  }

  try {
    customersListener = subscribeToCustomers((customers) => {
      dispatch(setCustomers(customers));
    });
  } catch (error) {
    console.error('Error initializing customers listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Create or update a customer in Firebase
 */
export const saveCustomer = (customerData) => (dispatch) => {
  return (async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Check if customer exists by phone/email
      const existingCustomer = await findCustomerByContact(
        customerData.phone,
        customerData.email
      );

      let result;
      if (existingCustomer) {
        // Update existing customer
        result = await updateCustomer(existingCustomer.id, customerData);
        dispatch(updateCustomerLocal({ id: existingCustomer.id, ...customerData }));
        result = { id: existingCustomer.id, ...customerData };
      } else {
        // Create new customer
        result = await createCustomer(customerData);
        dispatch(addCustomer(result));
      }

      dispatch(setLoading(false));
      return result;
    } catch (error) {
      console.error('Error saving customer:', error);
      dispatch(setError(error.message));
      throw error;
    }
  })();
};

/**
 * Update customer's pending balance
 */
export const updateCustomerBalance = (customerId, balanceChange) => async (dispatch) => {
  try {
    const updates = {
      pendingBalance: balanceChange
    };

    await updateCustomer(customerId, updates);
    dispatch(updateCustomerLocal({ id: customerId, ...updates }));
  } catch (error) {
    console.error('Error updating customer balance:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Create a new customer in Firebase
 */
export const createNewCustomer = (customerData) => async (dispatch) => {
  try {
    dispatch(clearError());

    const result = await createCustomer(customerData);
    // Note: addCustomer is not dispatched here because the Firebase
    // real-time listener will automatically update the state when the customer
    // is created in Firebase

    return result;
  } catch (error) {
    console.error('Error creating customer:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Update an existing customer in Firebase
 */
export const updateExistingCustomer = (customerId, updates) => async (dispatch) => {
  try {
    dispatch(clearError());

    const result = await updateCustomer(customerId, updates);
    // Note: updateCustomerLocal is not dispatched here because the Firebase
    // real-time listener will automatically update the state when the customer
    // is updated in Firebase

    return result;
  } catch (error) {
    console.error('Error updating customer:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Delete a customer from Firebase
 */
export const deleteExistingCustomer = (customerId) => async (dispatch) => {
  try {
    dispatch(clearError());

    await deleteCustomer(customerId);
    // Note: removeCustomerLocal is not dispatched here because the Firebase
    // real-time listener will automatically update the state when the customer
    // is deleted from Firebase

    return { id: customerId, deleted: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Cleanup customer listener (call on app unmount)
 */
export const cleanupCustomersListener = () => () => {
  if (customersListener) {
    customersListener();
    customersListener = null;
  }
};

// ==================== SELECTORS ====================

// Get all customers
export const selectAllCustomers = (state) => state.customers.customers;

// Get customer by phone
export const selectCustomerByPhone = (phone) => (state) => {
  const normalizePhone = (phone) => phone.replace(/\D/g, '');
  const normalizedInputPhone = normalizePhone(phone);

  return state.customers.customers.find(
    (customer) => normalizePhone(customer.phone) === normalizedInputPhone
  );
};

// Get customer by ID
export const selectCustomerById = (customerId) => (state) => {
  return state.customers.customers.find((customer) => customer.id === customerId);
};

// Get customers with pending balance
export const selectCustomersWithPendingBalance = (state) => {
  return state.customers.customers.filter(
    (customer) => (customer.pendingBalance || 0) > 0
  );
};

// Get total pending balance across all customers
export const selectTotalPendingBalance = (state) => {
  return state.customers.customers.reduce(
    (total, customer) => total + (customer.pendingBalance || 0),
    0
  );
};

// Get active customers
export const selectActiveCustomers = (state) => {
  return state.customers.customers.filter(
    (customer) => customer.status === 'Active'
  );
};

// Get loading state
export const selectCustomersLoading = (state) => state.customers.loading;

// Get error state
export const selectCustomersError = (state) => state.customers.error;

// Get sync status
export const selectCustomersSynced = (state) => state.customers.synced;

export default customersSlice.reducer;
