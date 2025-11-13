import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import ProductCard from '../../components/ProductCard';
import { spinachProducts } from '../../data/spinachProducts';

export default function Products() {

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
            Spinach Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Fresh, Frozen, and Organic spinach delivered to your door
          </Typography>
        </Box>

        {/* Products Grid */}
        <div className='row'>
          {spinachProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {/* Product Count */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {spinachProducts.length} product{spinachProducts.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
