'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import {
  setCartDrawerOpen,
  removeFromCart,
  updateQuantity,
  selectCartTotal,
} from '../store/slices/cartSlice';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isOpen = useSelector((state) => state.cart.isDrawerOpen);
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector(selectCartTotal);

  const handleClose = () => {
    dispatch(setCartDrawerOpen(false));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleIncrement = (productId, currentQuantity) => {
    dispatch(updateQuantity({ productId, quantity: currentQuantity + 1 }));
  };

  const handleDecrement = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ productId, quantity: currentQuantity - 1 }));
    }
  };

  const handleCheckout = () => {
    handleClose();
    router.push('/checkout');
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={handleClose}>
      <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Shopping Cart
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {cartItems.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add some spinach products to get started!
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {cartItems.map((item, index) => (
                <Box key={item.productId}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <Box sx={{ flexGrow: 1, ml: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{item.price.toFixed(2)}
                        </Typography>
                        <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(item.productId)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        width: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleDecrement(item.productId, item.quantity)}
                        sx={{ bgcolor: 'action.hover' }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleIncrement(item.productId, item.quantity)}
                        sx={{ bgcolor: 'action.hover' }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < cartItems.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {cartItems.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                ₹{cartTotal.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              sx={{ mb: 1 }}
            >
              Proceed to Checkout
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleClose}
            >
              Continue Shopping
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
