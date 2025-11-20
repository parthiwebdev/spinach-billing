'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  selectAllCustomers,
  selectCustomersLoading,
  selectCustomersError,
  selectCustomersSynced,
  createNewCustomer,
  updateExistingCustomer,
  deleteExistingCustomer,
  clearError
} from '../../store/slices/customersSlice';

export default function Customers() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const nameInputRef = useRef(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);

  // Focus name input when dialog transition ends
  const handleDialogEntered = () => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get customers from Redux store
  const customersData = useSelector(selectAllCustomers);
  const loading = useSelector(selectCustomersLoading);
  const error = useSelector(selectCustomersError);
  const synced = useSelector(selectCustomersSynced);

  const isLoadingData = !synced;

  // Filter customers based on search query
  const filteredCustomers = customersData.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      customer.phone.includes(query) ||
      (customer.city && customer.city.toLowerCase().includes(query))
    );
  });

  // Calculate statistics
  const totalCustomers = customersData.length;

  // Handle opening create dialog
  const handleOpenCreate = () => {
    setDialogMode('create');
    setFormData({
      name: '',
      phone: '',
      address: ''
    });
    setOpenDialog(true);
  };

  // Handle opening edit dialog
  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setDialogMode('edit');
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setOpenDialog(true);
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    dispatch(clearError());
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      if (dialogMode === 'create') {
        await dispatch(createNewCustomer(formData));
        setSnackbar({
          open: true,
          message: 'Customer created successfully!',
          severity: 'success'
        });
      } else {
        await dispatch(updateExistingCustomer(selectedCustomer.id, formData));
        setSnackbar({
          open: true,
          message: 'Customer updated successfully!',
          severity: 'success'
        });
      }
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (customer, e) => {
    e.stopPropagation();
    setCustomerToDelete(customer);
    setDeleteConfirmOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteExistingCustomer(customerToDelete.id));
      setSnackbar({
        open: true,
        message: 'Customer deleted successfully!',
        severity: 'success'
      });
      setDeleteConfirmOpen(false);
      setCustomerToDelete(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 2, md: 4 }, pb: { xs: 10, md: 4 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 4 }, px: { xs: 1, md: 0 } }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '3rem' } }}>
            Customers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            Add Customer
          </Button>
        </Box>

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
                    width: { xs: '25%', sm: '25%' }
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: { xs: '25%', sm: '20%' }
                  }}
                >
                  Contact
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: { xs: '30%', sm: '35%' },
                    display: { xs: 'none', sm: 'table-cell' }
                  }}
                >
                  Address
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                    width: { xs: '20%', sm: '20%' },
                    textAlign: 'center'
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingData ? (
                // Skeleton loading rows
                [...Array(5)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 } }}>
                      <Skeleton variant="text" width="70%" />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, display: { xs: 'none', sm: 'table-cell' } }}>
                      <Skeleton variant="text" width="90%" />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="circular" width={24} height={24} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length > 0 ? (
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

                    {/* Address */}
                    <TableCell
                      sx={{
                        py: { xs: 1.5, md: 2 },
                        display: { xs: 'none', sm: 'table-cell' }
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          color: customer.address ? 'text.primary' : 'text.secondary'
                        }}
                      >
                        {customer.address || '-'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: { xs: 1.5, md: 2 }, textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => handleOpenEdit(customer, e)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteClick(customer, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
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

      {/* Create/Edit Customer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionProps={{ onEntered: handleDialogEntered }}
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Add New Customer' : 'Edit Customer'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              inputRef={nameInputRef}
            />
            <TextField
              label="Contact Number"
              name="phone"
              type="number"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              required
              placeholder="9876543210"
            />
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSaving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSaving || !formData.name || !formData.phone}
          >
            {isSaving ? 'Saving...' : (dialogMode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{customerToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
