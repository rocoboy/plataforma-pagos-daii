import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { paymentService, UpdatePaymentRequest } from '../../services/paymentService';

const EditPaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const {
    data: paymentResponse,
    isLoading: isLoadingPayment,
    error: loadError,
  } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPayment(id!),
    enabled: !!id,
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (data: UpdatePaymentRequest) => paymentService.updatePayment(data),
    onSuccess: (response: any) => {
      if (response.success) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['payment', id] });
        navigate(`/payments/${id}`);
      }
    },
  });

  const payment = paymentResponse?.data;

  useEffect(() => {
    if (payment) {
      setSelectedStatus(payment.status);
    }
  }, [payment]);

  const handleStatusChange = (event: any) => {
    setSelectedStatus(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!id || !selectedStatus) return;

    const updateData: UpdatePaymentRequest = {
      id,
      status: selectedStatus as any,
    };

    updatePaymentMutation.mutate(updateData);
  };

  const handleBack = () => {
    navigate(`/payments/${id}`);
  };

  const getStatusChip = (status: string) => {
    const color = paymentService.getStatusColor(status as any);
    const label = paymentService.getStatusLabel(status as any);
    
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

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SUCCESS', label: 'Exitoso' },
    { value: 'FAILURE', label: 'Fallido' },
    { value: 'UNDERPAID', label: 'Pago Parcial' },
    { value: 'OVERPAID', label: 'Sobrepago' },
    { value: 'EXPIRED', label: 'Expirado' },
    { value: 'REFUND', label: 'Reembolso' },
  ];

  if (isLoadingPayment) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !paymentResponse?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al cargar el pago: {(paymentResponse as any)?.error || 'Error desconocido'}
        </Alert>
      </Box>
    );
  }

  if (!payment) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          No se encontró el pago con ID: {id}
        </Alert>
      </Box>
    );
  }

  const isLoading = updatePaymentMutation.isPending;
  const error = (updatePaymentMutation.data as any)?.error;
  const hasChanges = selectedStatus !== payment.status;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Editar Pago
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al actualizar el pago: {error}
        </Alert>
      )}

      {/* Payment Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen del Pago
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={4}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              ID de Referencia
            </Typography>
            <Typography variant="body1" fontFamily="monospace" fontWeight="bold">
              {payment.res_id}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Monto
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {paymentService.formatCurrency(payment.amount, payment.currency)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Usuario
            </Typography>
            <Typography variant="body1">
              {payment.user_id || 'Sin asignar'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Estado Actual
            </Typography>
            {getStatusChip(payment.status)}
          </Box>
        </Box>
      </Paper>

      {/* Edit Form */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cambiar Estado del Pago
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <FormControl fullWidth>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={selectedStatus}
                label="Nuevo Estado"
                onChange={handleStatusChange}
                disabled={isLoading}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getStatusChip(option.value)}
                      <Typography>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Status Change Preview */}
          {hasChanges && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Cambio de estado:</strong>
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                {getStatusChip(payment.status)}
                <Typography variant="body2">→</Typography>
                {getStatusChip(selectedStatus)}
              </Box>
            </Alert>
          )}

          {/* Actions */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !hasChanges}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{ backgroundColor: '#1976d2' }}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Estado'}
            </Button>
          </Box>
        </form>

        {/* Information */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Nota:</strong> Los cambios de estado son inmediatos y no se pueden deshacer. 
            Asegúrate de seleccionar el estado correcto antes de confirmar.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default EditPaymentPage;
