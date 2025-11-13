import { createSlice } from '@reduxjs/toolkit';
import { customersData } from '../../data/customersData';

const initialState = {
  customers: customersData,
};

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addOrUpdateCustomer: (state, action) => {
      const { customerInfo, orderId, orderTotal, orderDate } = action.payload;

      // Normalize phone number for comparison (remove formatting)
      const normalizePhone = (phone) => phone.replace(/\D/g, '');
      const normalizedInputPhone = normalizePhone(customerInfo.phone);

      // Find existing customer by phone or email
      const existingCustomer = state.customers.find(
        (customer) =>
          normalizePhone(customer.phone) === normalizedInputPhone ||
          customer.email.toLowerCase() === customerInfo.email.toLowerCase()
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
  },
});

export const { addOrUpdateCustomer } = customersSlice.actions;

// Selectors
export const selectAllCustomers = (state) => state.customers.customers;

export const selectCustomerByPhone = (phone) => (state) => {
  const normalizePhone = (phone) => phone.replace(/\D/g, '');
  const normalizedInputPhone = normalizePhone(phone);

  return state.customers.customers.find(
    (customer) => normalizePhone(customer.phone) === normalizedInputPhone
  );
};

export const selectCustomerById = (customerId) => (state) => {
  return state.customers.customers.find((customer) => customer.id === customerId);
};

export default customersSlice.reducer;
