import { createSlice } from '@reduxjs/toolkit';
import {
  createOrder as createOrderFirebase,
  updateOrder as updateOrderFirebase,
  subscribeToOrders,
  subscribeToCustomerOrders
} from '@/services/firebaseService';

// Store listeners outside of Redux state (not serializable)
let ordersListener = null;
const customerOrdersListeners = {};

const initialState = {
  orders: [],
  currentOrderId: null,
  loading: false,
  error: null,
  synced: false,
  lastSeenOrderCount: 0, // Track number of orders admin has seen
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Set all orders (from Firebase listener)
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.synced = true;
      state.loading = false;
      state.error = null;
    },

    // Set customer-specific orders
    setCustomerOrders: (state, action) => {
      const { customerId, orders } = action.payload;
      // Merge customer orders into main orders array
      const existingOrderIds = new Set(state.orders.map(o => o.id));
      const newOrders = orders.filter(o => !existingOrderIds.has(o.id));
      state.orders = [...newOrders, ...state.orders];
    },

    // Add order to local state (optimistic update)
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
      state.currentOrderId = action.payload.id;
    },

    // Update order in local state
    updateOrderLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const order = state.orders.find(o => o.id === id);
      if (order) {
        Object.assign(order, updates);
      }
    },

    // Legacy reducer for backward compatibility
    createOrder: (state, action) => {
      const { customerInfo, items, subtotal, shipping, total } = action.payload;

      const order = {
        id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Processing',
        customerInfo,
        items,
        subtotal,
        shipping,
        total,
        customerId: null,
      };

      state.orders.unshift(order);
      state.currentOrderId = order.id;
    },

    linkOrderToCustomer: (state, action) => {
      const { orderId, customerId } = action.payload;
      const order = state.orders.find(order => order.id === orderId);

      if (order) {
        order.customerId = customerId;
      }
    },

    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);

      if (order) {
        order.status = status;
      }
    },

    updateOrder: (state, action) => {
      const { orderId, items, subtotal, shipping, total } = action.payload;
      const order = state.orders.find(order => order.id === orderId);

      if (order) {
        order.items = items;
        order.subtotal = subtotal;
        order.shipping = shipping;
        order.total = total;
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Mark orders as seen (update lastSeenOrderCount)
    markOrdersAsSeen: (state) => {
      state.lastSeenOrderCount = state.orders.length;
    },
  },
});

export const {
  setOrders,
  setCustomerOrders,
  addOrder,
  updateOrderLocal,
  createOrder,
  linkOrderToCustomer,
  updateOrderStatus,
  updateOrder,
  setLoading,
  setError,
  clearError,
  markOrdersAsSeen,
} = ordersSlice.actions;

// ==================== ASYNC THUNKS ====================

/**
 * Initialize real-time listener for all orders
 */
export const initializeOrdersListener = () => (dispatch) => {
  // Don't create duplicate listeners
  if (ordersListener) {
    return;
  }

  try {
    ordersListener = subscribeToOrders((orders) => {
      dispatch(setOrders(orders));
    });
  } catch (error) {
    console.error('Error initializing orders listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Initialize real-time listener for customer's orders
 */
export const initializeCustomerOrdersListener = (customerId) => (dispatch) => {
  // Don't create duplicate listeners
  if (customerOrdersListeners[customerId]) {
    return;
  }

  try {
    customerOrdersListeners[customerId] = subscribeToCustomerOrders(customerId, (orders) => {
      dispatch(setCustomerOrders({ customerId, orders }));
    });
  } catch (error) {
    console.error('Error initializing customer orders listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Create order with pending balance calculation
 */
export const createOrderWithBalance = (orderData, customerId, customerPendingBalance = 0) => (dispatch) => {
  return (async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());

      // Calculate total with previous pending balance
      const previousPendingBalance = customerPendingBalance || 0;
      const subtotal = orderData.subtotal;
      const totalWithPending = subtotal + previousPendingBalance;

      const orderWithBalance = {
        ...orderData,
        previousPendingBalance,
        totalWithPending,
        status: 'Unpaid'
      };

      // Create order in Firebase (also updates customer balance)
      const order = await createOrderFirebase(orderWithBalance, customerId);

      // Optimistically add to local state
      dispatch(addOrder(order));

      dispatch(setLoading(false));
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      dispatch(setError(error.message));
      throw error;
    }
  })();
};

/**
 * Update order
 */
export const modifyOrder = (orderId, updates) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    await updateOrderFirebase(orderId, updates);
    dispatch(updateOrderLocal({ id: orderId, ...updates }));

    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error modifying order:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Cleanup orders listeners
 */
export const cleanupOrdersListeners = () => () => {
  if (ordersListener) {
    ordersListener();
    ordersListener = null;
  }
  Object.values(customerOrdersListeners).forEach(unsubscribe => {
    if (unsubscribe) unsubscribe();
  });
  Object.keys(customerOrdersListeners).forEach(key => {
    delete customerOrdersListeners[key];
  });
};

// ==================== SELECTORS ====================

// Get all orders
export const selectAllOrders = (state) => state.orders.orders;

// Get order by ID
export const selectOrderById = (orderId) => (state) => {
  return state.orders.orders.find(order => order.id === orderId);
};

// Get latest order
export const selectLatestOrder = (state) => {
  const { orders, currentOrderId } = state.orders;
  return orders.find(order => order.id === currentOrderId);
};

// Get customer's orders
export const selectCustomerOrders = (customerId) => (state) => {
  return state.orders.orders.filter(order => order.customerId === customerId);
};

// Get unpaid orders
export const selectUnpaidOrders = (state) => {
  return state.orders.orders.filter(order => order.status === 'Unpaid');
};

// Get paid orders
export const selectPaidOrders = (state) => {
  return state.orders.orders.filter(order => order.status === 'Paid');
};

// Get orders by status
export const selectOrdersByStatus = (status) => (state) => {
  return state.orders.orders.filter(order => order.status === status);
};

// Get total revenue from all orders
export const selectTotalRevenue = (state) => {
  return state.orders.orders.reduce((total, order) => {
    return total + (order.total || 0);
  }, 0);
};

// Get total pending amount
export const selectTotalPendingAmount = (state) => {
  return state.orders.orders
    .filter(order => order.status === 'Unpaid' || order.status === 'PartiallyPaid')
    .reduce((total, order) => {
      const paid = order.paidAmount || 0;
      const orderTotal = order.totalWithPending || order.total || 0;
      return total + (orderTotal - paid);
    }, 0);
};

// Get loading state
export const selectOrdersLoading = (state) => state.orders.loading;

// Get error state
export const selectOrdersError = (state) => state.orders.error;

// Get sync status
export const selectOrdersSynced = (state) => state.orders.synced;

// Get unseen order count (new orders since admin last visited orders page)
export const selectUnseenOrderCount = (state) => {
  const totalOrders = state.orders.orders.length;
  const lastSeen = state.orders.lastSeenOrderCount;
  return Math.max(0, totalOrders - lastSeen);
};

export default ordersSlice.reducer;
