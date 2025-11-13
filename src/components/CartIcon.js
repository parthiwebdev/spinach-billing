import { useSelector, useDispatch } from 'react-redux';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { toggleCartDrawer, selectCartItemCount } from '../store/slices/cartSlice';

const CartIcon = () => {
  const dispatch = useDispatch();
  const itemCount = useSelector(selectCartItemCount);

  const handleClick = () => {
    dispatch(toggleCartDrawer());
  };

  return (
    <IconButton color="inherit" onClick={handleClick} aria-label="shopping cart">
      <Badge badgeContent={itemCount} color="error">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
};

export default CartIcon;
