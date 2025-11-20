'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { selectAllCustomers } from '@/store/slices/customersSlice';
import { markOrdersAsSeen, selectOrdersSynced } from '@/store/slices/ordersSlice';
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
  Button,
  Alert,
  TextField,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

export default function Orders() {
  const router = useRouter();
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders.orders);
  const customers = useSelector(selectAllCustomers);
  const ordersSynced = useSelector(selectOrdersSynced);

  const [selectedDate, setSelectedDate] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const hasMarkedSeen = useRef(false);

  const isLoading = !ordersSynced;

  // Mark orders as seen when admin visits this page (only once per page visit)
  useEffect(() => {
    // Reset the flag when component mounts (page visit)
    hasMarkedSeen.current = false;
  }, []);

  useEffect(() => {
    // Mark as seen once when orders are synced and we haven't marked yet
    if (ordersSynced && !hasMarkedSeen.current) {
      console.log('Marking orders as seen. Total orders:', orders.length);
      dispatch(markOrdersAsSeen());
      hasMarkedSeen.current = true;
    }
  }, [dispatch, ordersSynced, orders.length]);

  // Create a map for quick customer lookup
  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach(customer => {
      map[customer.id] = customer;
    });
    return map;
  }, [customers]);

  // Helper function to get customer name
  const getCustomerName = (order) => {
    // First try customerInfo (old format)
    if (order.customerInfo?.name) {
      return order.customerInfo.name;
    }
    // Then try customerId lookup (new Firebase format)
    if (order.customerId && customerMap[order.customerId]) {
      return customerMap[order.customerId].name;
    }
    return 'Unknown Customer';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return { start: today, end: new Date() };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return { start: weekStart, end: new Date() };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setMonth(today.getMonth() - 1);
        return { start: monthStart, end: new Date() };
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);

    // Date filtering
    if (dateFilter !== 'all' && dateFilter !== 'custom') {
      const range = getDateRange(dateFilter);
      if (range) {
        const isInDateRange = orderDate >= range.start && orderDate <= range.end;
        if (!isInDateRange) return false;
      }
    }

    if (dateFilter === 'custom' && selectedDate) {
      const selected = new Date(selectedDate);
      const selectedStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const selectedEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
      const isInDateRange = orderDate >= selectedStart && orderDate <= selectedEnd;
      if (!isInDateRange) return false;
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const customerName = getCustomerName(order).toLowerCase();
      return customerName.includes(query);
    }

    return true;
  });

  console.log(filteredOrders);


  const handleDateFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setDateFilter(newFilter);
      if (newFilter !== 'custom') {
        setSelectedDate('');
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '3rem' }, px: { xs: 1, md: 0 } }}
        >
          Order History
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search orders by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          {searchQuery && (
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Found {filteredOrders.length} order(s)
              </Typography>
              <Button size="small" onClick={() => setSearchQuery('')}>
                Clear
              </Button>
            </Box>
          )}
        </Paper>

        {/* Date Filters */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, mx: { md: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter by Date
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={dateFilter}
            exclusive
            onChange={handleDateFilterChange}
            aria-label="date filter"
            fullWidth
          >
            <ToggleButton value="all">All Orders</ToggleButton>
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="custom">Select Date</ToggleButton>
          </ToggleButtonGroup>

          {dateFilter === 'custom' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredOrders.length} of {orders.length} orders
            </Typography>
            {dateFilter !== 'all' && (
              <Button
                size="small"
                onClick={() => {
                  setDateFilter('all');
                  setSelectedDate('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>

        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              You haven't placed any orders yet
            </Alert>
            <Button variant="contained" onClick={() => router.push('/products')}>
              Start Shopping
            </Button>
          </Paper>
        ) : filteredOrders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              No orders found for the selected date
            </Alert>
            <Button
              variant="contained"
              onClick={() => {
                setDateFilter('all');
                setSelectedDate('');
              }}
            >
              Show All Orders
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      width: '33.33%',
                      textAlign: { xs: 'left', md: 'center' }
                    }}
                  >
                    Customer Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      width: '33.33%',
                      textAlign: 'center'
                    }}
                  >
                    Items
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      width: '33.33%',
                      textAlign: 'center'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading rows
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="50%" height={14} />
                      </TableCell>
                      <TableCell align="center" sx={{ py: { xs: 1.5, md: 2 } }}>
                        <Skeleton variant="text" width={30} sx={{ mx: 'auto' }} />
                        <Skeleton variant="text" width={40} height={12} sx={{ mx: 'auto' }} />
                      </TableCell>
                      <TableCell align="center" sx={{ py: { xs: 1.5, md: 2 } }}>
                        <Skeleton variant="rounded" width={60} height={30} sx={{ mx: 'auto' }} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        cursor: 'pointer'
                      }}
                      onClick={() => router.push(`/orders/${order.id}`)}
                    >
                      <TableCell sx={{ py: { xs: 1.5, md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', md: '0.875rem' }
                          }}
                        >
                          {getCustomerName(order)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            fontSize: { xs: '0.7rem', md: '0.75rem' }
                          }}
                        >
                          {formatDate(order.date)} • ₹{order.total.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: { xs: 1.5, md: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            color: 'primary.main'
                          }}
                        >
                          {order.items.length}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
                        >
                          items
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: { xs: 1.5, md: 2 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: { xs: 0.5, md: 1 },
                            justifyContent: 'center'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="small"
                            startIcon={<ViewIcon sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }} />}
                            onClick={() => router.push(`/orders/${order.id}`)}
                            sx={{
                              fontSize: { xs: '0.7rem', md: '0.875rem' },
                              px: { xs: 1, md: 2 }
                            }}
                          >
                            View
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}
