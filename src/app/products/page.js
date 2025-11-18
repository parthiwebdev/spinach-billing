'use client';

import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { selectAllProducts } from '@/store/slices/productsSlice';

export default function Products() {
  const products = useSelector(selectAllProducts);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
            Products
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Spinach products list with prices
          </Typography>
        </Box>

        {/* Products Table */}
        <TableContainer component={Paper}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '60%'
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: '40%'
                  }}
                >
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        {product.name}
                      </Typography>
                      {product.unit && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            fontSize: { xs: '0.65rem', md: '0.7rem' }
                          }}
                        >
                          per {product.unit}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          color: 'primary.main'
                        }}
                      >
                        ₹{product.price}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No products found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Product Count */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
