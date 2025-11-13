import { createSlice } from '@reduxjs/toolkit';
import { spinachProducts } from '../../data/spinachProducts';

const initialState = {
  items: spinachProducts,
  selectedCategory: 'All',
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const { setCategory, setSearchQuery } = productsSlice.actions;

// Selectors
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

export default productsSlice.reducer;
