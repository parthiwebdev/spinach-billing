import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from '@mui/material';

const ProductCard = ({ product }) => {

  return (
    <div
      className='col-lg-4 col-md-3 col-6 mb-3'
    >
      <Card
        className='h-100'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          },
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 0 }}>
              {product.name}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
              ₹{product.price.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCard;
