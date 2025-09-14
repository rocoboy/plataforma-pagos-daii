import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { paymentService, Payment } from '../../services/paymentService';

const PaymentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: paymentsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getAllPayments(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const payments = paymentsResponse?.data || [];

  const handleCreatePayment = () => {
    navigate('/payments/create');
  };

  const handleViewPayment = (id: string) => {
    console.log('Navigating to payment detail, ID:', id); // Debug log
    navigate(`/payments/${id}`);
  };

  const handleEditPayment = (id: string) => {
    navigate(`/payments/${id}/edit`);
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await paymentService.deletePayment(paymentToDelete.id);
      if (result.success) {
        // Refetch the payments list
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      } else {
        console.error('Failed to delete payment:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      // You could add a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeletePayment = () => {
    setDeleteDialogOpen(false);
    setPaymentToDelete(null);
  };

  const getStatusChip = (payment: Payment) => {
    const color = paymentService.getStatusColor(payment.status);
    const label = paymentService.getStatusLabel(payment.status);
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold',
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !paymentsResponse?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al cargar los pagos: {paymentsResponse?.error || 'Error desconocido'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Gestión de Pagos
        </Typography>
        <Box>
          <Tooltip title="Actualizar">
            <IconButton onClick={() => refetch()} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePayment}
            sx={{ backgroundColor: '#1976d2' }}
          >
            Crear Pago
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Box display="flex" gap={2} mb={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {payments.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total de Pagos
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="success.main" fontWeight="bold">
            {payments.filter((p: Payment) => p.status === 'SUCCESS').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pagos Exitosos
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="warning.main" fontWeight="bold">
            {payments.filter((p: Payment) => p.status === 'PENDING').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pagos Pendientes
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" color="error.main" fontWeight="bold">
            {payments.filter((p: Payment) => p.status === 'FAILURE').length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pagos Fallidos
          </Typography>
        </Paper>
      </Box>

      {/* Payments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID de Referencia</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Estado</strong></TableCell>
                <TableCell><strong>Usuario</strong></TableCell>
                <TableCell><strong>Fecha de Creación</strong></TableCell>
                <TableCell align="right"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay pagos registrados
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleCreatePayment}
                      sx={{ mt: 2 }}
                    >
                      Crear primer pago
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: Payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {payment.res_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="bold">
                        {paymentService.formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(payment)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.user_id || 'Sin asignar'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.created_at).toLocaleString('es-AR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleViewPayment(payment.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPayment(payment.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePayment(payment)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeletePayment}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Estás seguro de que deseas eliminar este pago?
            {paymentToDelete && (
              <>
                <br /><br />
                <strong>ID:</strong> {paymentToDelete.id}<br />
                <strong>Reserva:</strong> {paymentToDelete.res_id}<br />
                <strong>Monto:</strong> ${paymentToDelete.amount} {paymentToDelete.currency}<br />
                <strong>Estado:</strong> {paymentService.getStatusLabel(paymentToDelete.status)}
                <br /><br />
                Esta acción no se puede deshacer.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeletePayment} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeletePayment} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsListPage;
