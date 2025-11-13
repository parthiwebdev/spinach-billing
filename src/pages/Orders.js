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
  Button,
  Alert,
  TextField,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const Orders = () => {
  const navigate = useNavigate();
  const orders = useSelector((state) => state.orders.orders);

  const [selectedDate, setSelectedDate] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

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

    if (dateFilter !== 'all' && dateFilter !== 'custom') {
      const range = getDateRange(dateFilter);
      if (range) {
        return orderDate >= range.start && orderDate <= range.end;
      }
    }

    if (dateFilter === 'custom' && selectedDate) {
      const selected = new Date(selectedDate);
      const selectedStart = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
      const selectedEnd = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), 23, 59, 59, 999);
      return orderDate >= selectedStart && orderDate <= selectedEnd;
    }

    return true;
  });

  const handleDateFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setDateFilter(newFilter);
      if (newFilter !== 'custom') {
        setSelectedDate('');
      }
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '3rem' }, px: { xs: 1, md: 0 } }}
        >
          Order History
        </Typography>

        {/* Date Filters */}
        <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, mx: { xs: 1, md: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filter by Date
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
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
            </Grid>

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
          </Grid>

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
            <Button variant="contained" onClick={() => navigate('/products')}>
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
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(order.date)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.items.length} item(s)</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ₹{order.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/orders/${order.id}/edit`)}
                          variant="outlined"
                        >
                          Edit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default Orders;
