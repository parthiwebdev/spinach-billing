'use client';

import { useRouter } from 'next/navigation';
import { Container, Typography, Box, Card, CardContent, Avatar, Skeleton } from '@mui/material';
import { useSelector } from 'react-redux';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Receipt as CreateOrderIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { selectAllCustomers, selectCustomersSynced } from '../store/slices/customersSlice';
import { selectAllOrders, selectOrdersSynced } from '../store/slices/ordersSlice';

export default function Home() {
  const router = useRouter();
  const customers = useSelector(selectAllCustomers);
  const orders = useSelector(selectAllOrders);
  const customersSynced = useSelector(selectCustomersSynced);
  const ordersSynced = useSelector(selectOrdersSynced);

  const isLoading = !customersSynced || !ordersSynced;

  // Calculate statistics
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4, fontSize: { xs: '1.75rem', md: '3rem' } }}>
          Dashboard
        </Typography>

        {/* Statistics Cards */}
        <div className='row'>
          <div className='col-lg-3 col-md-6 col-12 mb-sm-2 mb-2'>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Customers
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalCustomers}
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <PeopleIcon />
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
                    {isLoading ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalOrders}
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <OrdersIcon />
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
                      Today's Orders
                    </Typography>
                    {isLoading ? (
                      <Skeleton variant="text" width={60} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {todayOrders}
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <CreateOrderIcon />
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
                    {isLoading ? (
                      <Skeleton variant="text" width={100} height={40} />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        ₹{totalRevenue.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <TrendingIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Quick Actions
          </Typography>
          <div className='row'>
            <div className="col-md-4 col-sm-6 col-12 mb-sm-2 mb-2">
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => router.push('/create-order')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <CreateOrderIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Create Order
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Create a new order for customers
                  </Typography>
                </CardContent>
              </Card>
            </div>
            <div className="col-md-4 col-sm-6 col-12 mb-sm-2 mb-2">
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => router.push('/orders')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <OrdersIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      View Orders
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    View and manage all orders
                  </Typography>
                </CardContent>
              </Card>
            </div>
            <div className="col-md-4 col-sm-6 col-12 mb-sm-2 mb-2">
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => router.push('/customers')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      View Customers
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Manage customer information
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>
        </Box>
      </Container >
    </Box >
  );
}
