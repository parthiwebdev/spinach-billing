// Firebase Service - CRUD operations and real-time listeners for Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// Collection names
export const COLLECTIONS = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  PAYMENTS: 'payments'
};

// ==================== CUSTOMERS ====================

/**
 * Create a new customer
 */
export const createCustomer = async (customerData) => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const docRef = await addDoc(customersRef, {
      ...customerData,
      pendingBalance: customerData.pendingBalance || 0,
      totalSpent: customerData.totalSpent || 0,
      totalOrders: customerData.totalOrders || 0,
      status: customerData.status || 'Active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...customerData };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update customer data
 */
export const updateCustomer = async (customerId, updates) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await updateDoc(customerRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: customerId, ...updates };
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

/**
 * Delete a customer
 */
export const deleteCustomer = async (customerId) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await deleteDoc(customerRef);
    return { id: customerId, deleted: true };
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Get single customer by ID
 */
export const getCustomerById = async (customerId) => {
  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const customerSnap = await getDoc(customerRef);
    if (customerSnap.exists()) {
      return { id: customerSnap.id, ...customerSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

/**
 * Search customer by phone or email
 */
export const findCustomerByContact = async (phone, email) => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(
      customersRef,
      where('phone', '==', phone)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    // If not found by phone, try email
    if (email) {
      const emailQuery = query(
        customersRef,
        where('email', '==', email)
      );
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        const doc = emailSnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding customer:', error);
    throw error;
  }
};

/**
 * Real-time listener for all customers
 */
export const subscribeToCustomers = (callback) => {
  const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
  const q = query(customersRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    callback(customers);
  }, (error) => {
    console.error('Error in customers listener:', error);
  });
};

// ==================== PRODUCTS ====================

/**
 * Create a new product
 */
export const createProduct = async (productData) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const docRef = await addDoc(productsRef, {
      ...productData,
      inStock: productData.inStock ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update product
 */
export const updateProduct = async (productId, updates) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productId);
    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: productId, ...updates };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Real-time listener for all products
 */
export const subscribeToProducts = (callback) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, orderBy('name', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    callback(products);
  }, (error) => {
    console.error('Error in products listener:', error);
  });
};

// ==================== ORDERS ====================

/**
 * Create a new order and update customer balance
 */
export const createOrder = async (orderData, customerId) => {
  try {
    // Validate customerId
    if (!customerId) {
      throw new Error('Customer ID is required to create an order');
    }

    console.log('Firebase createOrder called with:', { orderData, customerId });
    console.log('DB instance:', db);

    const batch = writeBatch(db);

    // 1. Create order document
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    const orderRef = doc(ordersRef);

    // Calculate order values
    const orderSubtotal = orderData.subtotal || orderData.total || 0;
    const remainingBalance = orderSubtotal; // New order is unpaid

    const orderToSave = {
      ...orderData,
      customerId,
      status: orderData.status || 'Unpaid',
      paidAmount: 0,
      remainingBalance,
      total: orderData.total || orderSubtotal,
      date: orderData.date || new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    batch.set(orderRef, orderToSave);

    // 2. Update customer's pending balance and total orders
    // Only increment by the order subtotal (not totalWithPending which includes previous balance)
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    batch.update(customerRef, {
      pendingBalance: increment(orderSubtotal),
      totalOrders: increment(1),
      totalSpent: increment(orderSubtotal),
      updatedAt: serverTimestamp()
    });

    console.log('Committing batch...');
    await batch.commit();
    console.log('Batch committed successfully!');

    // Return order with ID for local state
    const result = {
      id: orderRef.id,
      ...orderData,
      customerId,
      status: orderToSave.status,
      paidAmount: 0,
      remainingBalance,
      total: orderToSave.total,
      date: orderToSave.date
    };
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrder = async (orderId, updates) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { id: orderId, ...updates };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderSnap = await getDoc(orderRef);
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

/**
 * Real-time listener for all orders
 */
export const subscribeToOrders = (callback) => {
  console.log('Setting up orders listener...');
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  // Query without ordering to avoid index issues, sort client-side
  const q = query(ordersRef);

  return onSnapshot(q, (snapshot) => {
    console.log('Orders snapshot received:', snapshot.docs.length, 'documents');
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        date: data.date || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    // Sort by date descending (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('Processed orders:', orders);
    callback(orders);
  }, (error) => {
    console.error('Error in orders listener:', error);
  });
};

/**
 * Real-time listener for customer's orders
 */
export const subscribeToCustomerOrders = (customerId, callback) => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    callback(orders);
  }, (error) => {
    console.error('Error in customer orders listener:', error);
  });
};

// ==================== PAYMENTS ====================

/**
 * Record a payment and update customer balance
 */
export const recordPayment = async (paymentData) => {
  try {
    const { customerId, amountPaid, orderId, paymentMethod = 'Cash', notes = '' } = paymentData;

    // Get current customer data
    const customer = await getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const previousBalance = customer.pendingBalance || 0;
    const newBalance = Math.max(0, previousBalance - amountPaid); // Don't go negative

    const batch = writeBatch(db);

    // 1. Create payment record
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const paymentRef = doc(paymentsRef);

    batch.set(paymentRef, {
      customerId,
      orderId: orderId || null,
      amountPaid,
      paymentMethod,
      notes,
      previousBalance,
      newBalance,
      paymentDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    // 2. Update customer's pending balance and total spent
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    batch.update(customerRef, {
      pendingBalance: newBalance,
      totalSpent: increment(amountPaid),
      updatedAt: serverTimestamp()
    });

    // 3. If orderId is provided, update order status
    if (orderId) {
      const order = await getOrderById(orderId);
      if (order) {
        const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
        const orderTotal = order.totalWithPending || order.total || 0;

        // Determine new order status based on payment
        let newStatus = 'Unpaid';
        if (amountPaid >= orderTotal) {
          newStatus = 'Paid';
        } else if (amountPaid > 0) {
          newStatus = 'PartiallyPaid';
        }

        batch.update(orderRef, {
          status: newStatus,
          paidAmount: increment(amountPaid),
          updatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();

    return {
      id: paymentRef.id,
      ...paymentData,
      previousBalance,
      newBalance,
      paymentDate: new Date()
    };
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

/**
 * Real-time listener for all payments
 */
export const subscribeToPayments = (callback) => {
  const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
  const q = query(paymentsRef, orderBy('paymentDate', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        paymentDate: data.paymentDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    callback(payments);
  }, (error) => {
    console.error('Error in payments listener:', error);
  });
};

/**
 * Real-time listener for customer's payment history
 */
export const subscribeToCustomerPayments = (customerId, callback) => {
  const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
  const q = query(
    paymentsRef,
    where('customerId', '==', customerId),
    orderBy('paymentDate', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        paymentDate: data.paymentDate?.toDate?.()?.toISOString() || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });
    callback(payments);
  }, (error) => {
    console.error('Error in customer payments listener:', error);
  });
};

// ==================== BATCH OPERATIONS ====================

/**
 * Bulk create products (for data migration)
 */
export const bulkCreateProducts = async (products) => {
  try {
    const batch = writeBatch(db);
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);

    products.forEach(product => {
      const productRef = doc(productsRef);
      batch.set(productRef, {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return { success: true, count: products.length };
  } catch (error) {
    console.error('Error bulk creating products:', error);
    throw error;
  }
};

/**
 * Bulk create customers (for data migration)
 */
export const bulkCreateCustomers = async (customers) => {
  try {
    const batch = writeBatch(db);
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const customerIds = [];

    customers.forEach(customer => {
      const customerRef = doc(customersRef);
      customerIds.push(customerRef.id);
      batch.set(customerRef, {
        ...customer,
        pendingBalance: customer.pendingBalance || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return { success: true, count: customers.length, ids: customerIds };
  } catch (error) {
    console.error('Error bulk creating customers:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Delete document (use with caution)
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true, id: docId };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Get all documents from a collection (one-time fetch)
 */
export const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};
