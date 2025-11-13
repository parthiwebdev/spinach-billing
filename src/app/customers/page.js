'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
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
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { selectAllCustomers } from '../../store/slices/customersSlice';

export default function Customers() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Get customers from Redux store
  const customersData = useSelector(selectAllCustomers);

  // Filter customers based on search query
  const filteredCustomers = customersData.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.city.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const totalCustomers = customersData.length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: { xs: 2, md: 4 }, fontSize: { xs: '1.75rem', md: '3rem' }, px: { xs: 1, md: 0 } }}>
          Customers
        </Typography>
        <div className='row'>
          <div className='col-lg-3 col-md-6 col-12 mb-sm-2 mb-2'>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Customers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalCustomers}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search customers by name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Customers Table */}
        <TableContainer component={Paper}>
          <Table sx={{ width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: { xs: '50%', sm: '60%' }
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: { xs: '50%', sm: '40%' }
                  }}
                >
                  Contact
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    onClick={() => router.push(`/customers/${customer.id}/orders`)}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                  >
                    {/* Customer Name */}
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.875rem' }
                        }}
                      >
                        {customer.name}
                      </Typography>
                    </TableCell>

                    {/* Contact - Phone only without country code */}
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon
                          fontSize="small"
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.25rem' }
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          {customer.phone.replace(/^\(\d{3}\)\s/, '')}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Results Count */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCustomers.length} of {totalCustomers} customer
            {totalCustomers !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
