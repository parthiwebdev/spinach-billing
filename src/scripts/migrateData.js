/**
 * Data Migration Script
 *
 * This script migrates existing mock data (products, customers, and orders) to Firebase Firestore
 *
 * Usage:
 * 1. Ensure Firebase config is set up in .env.local
 * 2. Run from Next.js app by visiting /migrate (create a page for this)
 * OR
 * 3. Run this script standalone: node src/scripts/migrateData.js
 */

import { spinachProducts } from '../data/spinachProducts';
import { customersData } from '../data/customersData';
import {
  bulkCreateProducts,
  bulkCreateCustomers,
  updateCustomer
} from '../services/firebaseService';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Collection names
const COLLECTIONS_NAMES = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PAYMENTS: 'payments'
};

/**
 * Transform product data for Firebase
 */
const transformProductsForFirebase = (products) => {
  return products.map(product => ({
    name: product.name,
    category: product.category,
    price: product.price,
    unit: product.unit,
    description: product.description,
    image: product.image,
    inStock: product.inStock !== undefined ? product.inStock : true
  }));
};

/**
 * Transform customer data for Firebase
 */
const transformCustomersForFirebase = (customers) => {
  return customers.map(customer => ({
    name: customer.name,
    phone: customer.phone,
    address: customer.address || '',
    totalOrders: 0,
    totalSpent: 0,
    pendingBalance: 0,
    status: 'Active'
  }));
};

/**
 * Create sample orders for customers
 */
const createSampleOrders = async (customerIds, products) => {
  const ordersRef = collection(db, COLLECTIONS_NAMES.ORDERS);
  const orders = [];

  // Create sample orders for customers
  const sampleOrdersData = [
    // Customer 0 - 3 orders
    {
      customerIndex: 0,
      items: [
        { productIndex: 0, quantity: 5 },
        { productIndex: 1, quantity: 3 }
      ],
      paid: false
    },
    {
      customerIndex: 0,
      items: [
        { productIndex: 2, quantity: 2 }
      ],
      paid: true
    },
    {
      customerIndex: 0,
      items: [
        { productIndex: 3, quantity: 4 },
        { productIndex: 4, quantity: 2 }
      ],
      paid: false
    },
    // Customer 1 - 2 orders
    {
      customerIndex: 1,
      items: [
        { productIndex: 0, quantity: 10 },
        { productIndex: 3, quantity: 5 }
      ],
      paid: false
    },
    {
      customerIndex: 1,
      items: [
        { productIndex: 5, quantity: 3 },
        { productIndex: 6, quantity: 2 }
      ],
      paid: true
    },
    // Customer 2 - 2 orders
    {
      customerIndex: 2,
      items: [
        { productIndex: 1, quantity: 8 },
        { productIndex: 4, quantity: 4 }
      ],
      paid: true
    },
    {
      customerIndex: 2,
      items: [
        { productIndex: 7, quantity: 6 }
      ],
      paid: false
    },
    // Customer 3 - 2 orders
    {
      customerIndex: 3,
      items: [
        { productIndex: 0, quantity: 15 },
        { productIndex: 2, quantity: 10 }
      ],
      paid: false
    },
    {
      customerIndex: 3,
      items: [
        { productIndex: 8, quantity: 5 }
      ],
      paid: true
    },
    // Customer 4 - 1 order
    {
      customerIndex: 4,
      items: [
        { productIndex: 1, quantity: 20 },
        { productIndex: 5, quantity: 8 },
        { productIndex: 9, quantity: 3 }
      ],
      paid: false
    }
  ];

  for (const orderData of sampleOrdersData) {
    if (customerIds[orderData.customerIndex]) {
      const customerId = customerIds[orderData.customerIndex];

      // Build order items
      const items = orderData.items.map(item => {
        const product = products[item.productIndex];
        return {
          productId: item.productIndex.toString(),
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity
        };
      });

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal;

      // Create order
      const order = {
        customerId,
        items,
        subtotal,
        total,
        previousPendingBalance: 0,
        totalWithPending: total,
        status: orderData.paid ? 'Paid' : 'Unpaid',
        paidAmount: orderData.paid ? total : 0,
        remainingBalance: orderData.paid ? 0 : total,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(ordersRef, order);
      orders.push({ id: docRef.id, ...order, customerId });
    }
  }

  return orders;
};

/**
 * Update customer balances based on orders
 */
const updateCustomerBalances = async (customerIds, orders) => {
  // Calculate pending balance for each customer
  const customerBalances = {};

  for (const order of orders) {
    if (!customerBalances[order.customerId]) {
      customerBalances[order.customerId] = {
        pendingBalance: 0,
        totalOrders: 0,
        totalSpent: 0
      };
    }

    customerBalances[order.customerId].totalOrders += 1;
    customerBalances[order.customerId].totalSpent += order.total;

    if (order.status === 'Unpaid') {
      customerBalances[order.customerId].pendingBalance += order.remainingBalance;
    }
  }

  // Update each customer with their calculated balances
  for (const customerId of Object.keys(customerBalances)) {
    await updateCustomer(customerId, customerBalances[customerId]);
  }

  return customerBalances;
};

/**
 * Main migration function
 */
export const migrateAllData = async () => {
  try {
    console.log('Starting data migration...');

    // Transform data
    const productsToMigrate = transformProductsForFirebase(spinachProducts);
    const customersToMigrate = transformCustomersForFirebase(customersData);

    console.log(`Migrating ${productsToMigrate.length} products...`);
    const productsResult = await bulkCreateProducts(productsToMigrate);
    console.log(`Products migration complete: ${productsResult.count} products added`);

    console.log(`Migrating ${customersToMigrate.length} customers...`);
    const customersResult = await bulkCreateCustomers(customersToMigrate);
    console.log(`Customers migration complete: ${customersResult.count} customers added`);

    // Create sample orders
    console.log('Creating sample orders...');
    const orders = await createSampleOrders(customersResult.ids, spinachProducts);
    console.log(`Orders created: ${orders.length} orders`);

    // Update customer balances
    console.log('Updating customer balances...');
    await updateCustomerBalances(customersResult.ids, orders);
    console.log('Customer balances updated');

    console.log('Data migration completed successfully!');
    return {
      success: true,
      products: productsResult.count,
      customers: customersResult.count,
      orders: orders.length
    };
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

/**
 * Migrate only products
 */
export const migrateProducts = async () => {
  try {
    console.log('Starting products migration...');
    const productsToMigrate = transformProductsForFirebase(spinachProducts);
    const result = await bulkCreateProducts(productsToMigrate);
    console.log(`Products migration complete: ${result.count} products added`);
    return result;
  } catch (error) {
    console.error('Error migrating products:', error);
    throw error;
  }
};

/**
 * Migrate only customers
 */
export const migrateCustomers = async () => {
  try {
    console.log('Starting customers migration...');
    const customersToMigrate = transformCustomersForFirebase(customersData);
    const result = await bulkCreateCustomers(customersToMigrate);
    console.log(`Customers migration complete: ${result.count} customers added`);
    return result;
  } catch (error) {
    console.error('Error migrating customers:', error);
    throw error;
  }
};

// For direct execution (uncomment if needed)
// if (typeof window === 'undefined') {
//   // Running in Node.js environment
//   migrateAllData()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error(error);
//       process.exit(1);
//     });
// }
