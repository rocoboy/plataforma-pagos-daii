import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { paymentService } from '../../services/paymentService';

const PaymentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: paymentResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPayment(id!),
    enabled: !!id,
  });

  const payment = paymentResponse?.data;

  const handleBack = () => {
    navigate('/payments');
  };

  const handleEdit = () => {
    navigate(`/payments/${id}/edit`);
  };

  const getStatusChip = () => {
    if (!payment) return null;
    
    const color = paymentService.getStatusColor(payment.status);
    const label = paymentService.getStatusLabel(payment.status);
    
    return (
      <Chip
        label={label}
        size="medium"
        sx={{
          backgroundColor: color,
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          padding: '8px 16px',
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

  if (error || !paymentResponse?.success) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Error al cargar el pago: {paymentResponse?.error || 'Error desconocido'}
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

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Detalles del Pago
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEdit}
        >
          Editar Pago
        </Button>
      </Box>

      {/* Payment Details */}
      <Paper sx={{ p: 3 }}>
        {/* Status and Amount */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              {paymentService.formatCurrency(payment.amount, payment.currency)}
            </Typography>
            {getStatusChip()}
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              ID del Pago
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {payment.id}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Basic Information */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Información Básica
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
                Moneda
              </Typography>
              <Typography variant="body1">
                {payment.currency}
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
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Timestamps */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Fechas
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Fecha de Creación
              </Typography>
              <Typography variant="body1">
                {new Date(payment.created_at).toLocaleString('es-AR')}
              </Typography>
            </Box>
            {payment.modified_at && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Última Modificación
                </Typography>
                <Typography variant="body1">
                  {new Date(payment.modified_at).toLocaleString('es-AR')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Metadata */}
        {payment.meta && Object.keys(payment.meta).length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Información Adicional
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                {Object.entries(payment.meta).map(([key, value]) => (
                  <Box key={key} mb={1}>
                    <Typography variant="body2" color="text.secondary" component="span">
                      {key}:
                    </Typography>
                    <Typography variant="body2" component="span" ml={1}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          </>
        )}

        {/* Raw Data (for debugging) */}
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            Datos Técnicos
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
              {JSON.stringify(payment, null, 2)}
            </pre>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

export default PaymentDetailPage;
