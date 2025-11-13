import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Grid,
  Card,
  CardContent,
  Avatar,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { selectAllCustomers } from '../store/slices/customersSlice';

const Customers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

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
  const activeCustomers = customersData.filter((c) => c.status === 'Active').length;
  const totalRevenue = customersData.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = customersData.reduce((sum, c) => sum + c.totalOrders, 0);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Toggle customer order history
  const handleToggleCustomer = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

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
          <div className='col-lg-3 col-md-6 col-12 mb-sm-2 mb-2'>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Customers
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {activeCustomers}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className='col-lg-3 col-md-6 col-12 mb-sm-2 mb-2'>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      ₹{totalRevenue.toFixed(2)}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <ShoppingCartIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </div>
          <div className='col-lg-3 col-md-6 col-12 mb-sm-2 mb-2'>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {totalOrders}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Customers Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Orders</TableCell>
                <TableCell sx={{ fontWeight: 600 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <>
                    <TableRow
                      key={customer.id}
                      onClick={() => navigate(`/customers/${customer.id}/orders`)}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer',
                      }}
                    >
                      {/* Customer Name */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.name}
                        </Typography>
                      </TableCell>

                      {/* Contact - Phone only without country code */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {customer.phone.replace(/^\(\d{3}\)\s/, '')}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Orders */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {customer.totalOrders}
                        </Typography>
                      </TableCell>

                      {/* Expand Button */}
                      <TableCell align="right">
                        {customer.orderHistory && customer.orderHistory.length > 0 && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCustomer(customer.id);
                            }}
                          >
                            {expandedCustomer === customer.id ? <ArrowUpIcon /> : <ArrowDownIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Order History Row */}
                    {customer.orderHistory && customer.orderHistory.length > 0 && (
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                          <Collapse in={expandedCustomer === customer.id} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2, px: 2, bgcolor: 'action.hover' }}>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                Order History
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {customer.orderHistory.map((order) => (
                                    <TableRow key={order.orderId}>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                          {order.orderId.substring(0, 8)}...
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {formatDate(order.date)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          ₹{order.total.toFixed(2)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
};

export default Customers;
