import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage'; // Use custom storage for Next.js compatibility
import { combineReducers } from 'redux';
import themeReducer from './slices/themeSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import customersReducer from './slices/customersSlice';
import authReducer from './slices/authSlice';
import paymentsReducer from './slices/paymentsSlice';

// Combine all reducers
const rootReducer = combineReducers({
  theme: themeReducer,
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
  customers: customersReducer,
  auth: authReducer,
  payments: paymentsReducer,
});

// Persist configuration - Only persist theme and auth, NOT data from Firebase
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'auth'], // Only persist theme and auth - all other data comes from Firebase real-time
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
