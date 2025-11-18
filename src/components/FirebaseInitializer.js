'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeCustomersListener, cleanupCustomersListener } from '@/store/slices/customersSlice';
import { initializeProductsListener, cleanupProductsListener } from '@/store/slices/productsSlice';
import { initializeOrdersListener, cleanupOrdersListeners } from '@/store/slices/ordersSlice';
import { initializePaymentsListener, cleanupPaymentsListeners } from '@/store/slices/paymentsSlice';

/**
 * FirebaseInitializer Component
 *
 * This component initializes all Firebase real-time listeners when the app loads
 * and cleans them up when the component unmounts.
 *
 * It should be placed at the root level of your application (e.g., in layout.js)
 */
export default function FirebaseInitializer() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth?.user);

  useEffect(() => {
    // Only initialize listeners if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    console.log('Initializing Firebase real-time listeners...');

    // Initialize all Firebase real-time listeners
    dispatch(initializeCustomersListener());
    dispatch(initializeProductsListener());
    dispatch(initializeOrdersListener());
    dispatch(initializePaymentsListener());

    // Cleanup function - runs when component unmounts
    return () => {
      console.log('Cleaning up Firebase listeners...');
      dispatch(cleanupCustomersListener());
      dispatch(cleanupProductsListener());
      dispatch(cleanupOrdersListeners());
      dispatch(cleanupPaymentsListeners());
    };
  }, [dispatch, isAuthenticated]);

  // This component doesn't render anything
  return null;
}
