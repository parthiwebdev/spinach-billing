import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrderId: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const { customerInfo, items, subtotal, tax, shipping, total } = action.payload;

      const order = {
        id: Date.now().toString(),
        orderNumber: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Processing',
        customerInfo,
        items,
        subtotal,
        tax,
        shipping,
        total,
        customerId: null, // Will be set when customer is added/updated
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
      const { orderId, items, subtotal, tax, shipping, total } = action.payload;
      const order = state.orders.find(order => order.id === orderId);

      if (order) {
        order.items = items;
        order.subtotal = subtotal;
        order.tax = tax;
        order.shipping = shipping;
        order.total = total;
      }
    },
  },
});

export const { createOrder, linkOrderToCustomer, updateOrderStatus, updateOrder } = ordersSlice.actions;

// Selectors
export const selectAllOrders = (state) => state.orders.orders;

export const selectOrderById = (orderId) => (state) => {
  return state.orders.orders.find(order => order.id === orderId);
};

export const selectLatestOrder = (state) => {
  const { orders, currentOrderId } = state.orders;
  return orders.find(order => order.id === currentOrderId);
};

export default ordersSlice.reducer;
