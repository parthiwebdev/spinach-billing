import { createSlice } from '@reduxjs/toolkit';
import {
  createProduct,
  updateProduct,
  subscribeToProducts
} from '@/services/firebaseService';

// Store listener outside of Redux state (not serializable)
let productsListener = null;

const initialState = {
  items: [], // Start with empty array - only show Firebase data
  selectedCategory: 'All',
  searchQuery: '',
  loading: false,
  error: null,
  synced: false
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Set all products (from Firebase listener)
    setProducts: (state, action) => {
      state.items = action.payload;
      state.synced = true;
      state.loading = false;
      state.error = null;
    },

    // Add new product to local state
    addProduct: (state, action) => {
      state.items.push(action.payload);
    },

    // Update existing product in local state
    updateProductLocal: (state, action) => {
      const { id, ...updates } = action.payload;
      const product = state.items.find(p => p.id === id);
      if (product) {
        Object.assign(product, updates);
      }
    },

    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
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
    }
  },
});

export const {
  setProducts,
  addProduct,
  updateProductLocal,
  setCategory,
  setSearchQuery,
  setLoading,
  setError,
  clearError
} = productsSlice.actions;

// ==================== ASYNC THUNKS ====================

/**
 * Initialize real-time listener for products
 */
export const initializeProductsListener = () => (dispatch) => {
  // Don't create duplicate listeners
  if (productsListener) {
    return;
  }

  try {
    productsListener = subscribeToProducts((products) => {
      dispatch(setProducts(products));
    });
  } catch (error) {
    console.error('Error initializing products listener:', error);
    dispatch(setError(error.message));
  }
};

/**
 * Add a new product to Firebase
 */
export const saveProduct = (productData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const product = await createProduct(productData);
    dispatch(addProduct(product));

    dispatch(setLoading(false));
    return product;
  } catch (error) {
    console.error('Error saving product:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Update product in Firebase
 */
export const modifyProduct = (productId, updates) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    await updateProduct(productId, updates);
    dispatch(updateProductLocal({ id: productId, ...updates }));

    dispatch(setLoading(false));
  } catch (error) {
    console.error('Error modifying product:', error);
    dispatch(setError(error.message));
    throw error;
  }
};

/**
 * Cleanup products listener
 */
export const cleanupProductsListener = () => () => {
  if (productsListener) {
    productsListener();
    productsListener = null;
  }
};

// ==================== SELECTORS ====================

// Get filtered products
export const selectFilteredProducts = (state) => {
  const { items, selectedCategory, searchQuery } = state.products;

  let filtered = items;

  // Filter by category
  if (selectedCategory !== 'All') {
    filtered = filtered.filter(product => product.category === selectedCategory);
  }

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filtered;
};

// Get all products
export const selectAllProducts = (state) => state.products.items;

// Get product by ID
export const selectProductById = (productId) => (state) => {
  return state.products.items.find(p => p.id === productId);
};

// Get in-stock products
export const selectInStockProducts = (state) => {
  return state.products.items.filter(p => p.inStock);
};

// Get loading state
export const selectProductsLoading = (state) => state.products.loading;

// Get error state
export const selectProductsError = (state) => state.products.error;

// Get sync status
export const selectProductsSynced = (state) => state.products.synced;

export default productsSlice.reducer;
