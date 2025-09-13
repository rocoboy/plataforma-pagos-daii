import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Upload as UploadIcon } from '@mui/icons-material';
import { paymentService, CreatePaymentRequest } from '../../services/paymentService';
import { mockTransactions, mockTransactionDetails } from '../../data/mockData';

const CreatePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreatePaymentRequest>({
    res_id: '',
    amount: 0,
    currency: 'ARS',
    user_id: '',
    meta: {},
  });

  const [metaFields, setMetaFields] = useState({
    description: '',
    order_id: '',
    customer_email: '',
  });

  const createPaymentMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentService.createPayment(data),
    onSuccess: (response: any) => {
      if (response.success) {
        // Invalidate payments query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        navigate('/payments');
      }
    },
  });

  // Mock data upload functionality
  const [uploadResults, setUploadResults] = useState<{
    successful: any[];
    errors: any[];
    isUploading: boolean;
  }>({
    successful: [],
    errors: [],
    isUploading: false,
  });

  const transformMockToPayment = (transaction: any, detail?: any): CreatePaymentRequest => {
    const statusMapping = {
      'confirmado': 'SUCCESS',
      'pendiente': 'PENDING', 
      'cancelado': 'FAILURE'
    } as const;

    // Store all flight and transaction details in meta field
    const meta = {
      destination: transaction.destination,
      airline: transaction.airline,
      purchaseDate: transaction.purchaseDate,
      originalStatus: transaction.status,
      ...(detail && {
        paymentMethod: detail.paymentMethod,
        cardNumber: detail.cardNumber,
        flightNumber: detail.flightNumber,
        departure: detail.departure,
        arrival: detail.arrival,
        duration: detail.duration,
        flightClass: detail.flightClass
      })
    };

    return {
      res_id: transaction.reservationId,
      amount: transaction.amount,
      currency: 'USD',
      user_id: `user_${transaction.id}`,
      meta
    };
  };

  const uploadMockData = async () => {
    setUploadResults(prev => ({ ...prev, isUploading: true, successful: [], errors: [] }));

    const results = [];
    const errors = [];

    for (const transaction of mockTransactions) {
      try {
        // Get corresponding detail if available
        const detail = mockTransactionDetails[transaction.id];
        
        // Transform data to match backend schema
        const paymentData = transformMockToPayment(transaction, detail);
        
        // Upload to backend
        const response = await paymentService.createPayment(paymentData);
        
        if (response.success) {
          results.push({ transaction, payment: response.data });
        } else {
          errors.push({ transaction, error: response.error });
        }
        
        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors.push({ 
          transaction, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    setUploadResults({
      successful: results,
      errors,
      isUploading: false,
    });

    // Refresh the payments list
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const handleChange = (field: keyof CreatePaymentRequest) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData((prev: CreatePaymentRequest) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleMetaChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMetaFields(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Build meta object from individual fields
    const meta = Object.entries(metaFields)
      .filter(([_, value]) => value.trim() !== '')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const paymentData: CreatePaymentRequest = {
      ...formData,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      user_id: formData.user_id || undefined,
    };

    createPaymentMutation.mutate(paymentData);
  };

  const handleBack = () => {
    navigate('/payments');
  };

  const isLoading = createPaymentMutation.isPending;
  const error = (createPaymentMutation.data as any)?.error;

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Crear Nuevo Pago
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al crear el pago: {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Basic Payment Information */}
            <Typography variant="h6">
              Información Básica del Pago
            </Typography>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                required
                label="ID de Referencia"
                value={formData.res_id}
                onChange={handleChange('res_id')}
                helperText="Identificador único para el pago"
                placeholder="ej: order-12345, invoice-abc123"
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Monto"
                value={formData.amount}
                onChange={handleChange('amount')}
                inputProps={{ 
                  min: 0, 
                  step: 0.01,
                  style: { textAlign: 'right' }
                }}
                helperText="Monto del pago en la moneda seleccionada"
              />
            </Box>

            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Moneda</InputLabel>
                <Select
                  value={formData.currency}
                  label="Moneda"
                  onChange={(e) => setFormData((prev: CreatePaymentRequest) => ({ ...prev, currency: e.target.value as any }))}
                >
                  <MenuItem value="ARS">Peso Argentino (ARS)</MenuItem>
                  <MenuItem value="USD">Dólar Estadounidense (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="ID de Usuario"
                value={formData.user_id}
                onChange={handleChange('user_id')}
                helperText="Identificador del usuario (opcional)"
                placeholder="ej: user-123, customer@email.com"
              />
            </Box>

            {/* Metadata Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Información Adicional (Opcional)
            </Typography>

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Descripción"
                value={metaFields.description}
                onChange={handleMetaChange('description')}
                helperText="Descripción del pago"
                placeholder="ej: Compra de productos, Suscripción mensual"
              />

              <TextField
                fullWidth
                label="ID de Orden"
                value={metaFields.order_id}
                onChange={handleMetaChange('order_id')}
                helperText="Número de orden relacionado"
                placeholder="ej: ORD-001, 12345"
              />
            </Box>

            <TextField
              fullWidth
              type="email"
              label="Email del Cliente"
              value={metaFields.customer_email}
              onChange={handleMetaChange('customer_email')}
              helperText="Email del cliente para notificaciones"
              placeholder="cliente@email.com"
            />

            {/* Preview */}
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Vista Previa del Pago
              </Typography>
              <Typography variant="body2">
                <strong>Referencia:</strong> {formData.res_id || 'Sin especificar'}
              </Typography>
              <Typography variant="body2">
                <strong>Monto:</strong> {paymentService.formatCurrency(formData.amount, formData.currency || 'ARS')}
              </Typography>
              <Typography variant="body2">
                <strong>Usuario:</strong> {formData.user_id || 'Sin asignar'}
              </Typography>
              <Typography variant="body2">
                <strong>Estado Inicial:</strong> Pendiente
              </Typography>
            </Paper>

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
                disabled={isLoading || !formData.res_id || formData.amount <= 0}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ backgroundColor: '#1976d2' }}
              >
                {isLoading ? 'Creando...' : 'Crear Pago'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* Mock Data Upload Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Cargar Datos de Prueba
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Esta función carga todos los datos de transacciones de ejemplo al servidor Supabase. 
          Se cargarán {mockTransactions.length} transacciones con toda su información de vuelos.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Upload Button */}
        <Box mb={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={uploadMockData}
            disabled={uploadResults.isUploading}
            startIcon={uploadResults.isUploading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ mr: 2 }}
          >
            {uploadResults.isUploading ? 'Cargando...' : 'Cargar Datos de Prueba'}
          </Button>
          
          {(uploadResults.successful.length > 0 || uploadResults.errors.length > 0) && (
            <Typography variant="body2" component="span">
              ✅ {uploadResults.successful.length} exitosos, ❌ {uploadResults.errors.length} fallidos
            </Typography>
          )}
        </Box>

        {/* Results */}
        {uploadResults.successful.length > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Transacciones cargadas exitosamente: {uploadResults.successful.length}
            </Typography>
            <List dense>
              {uploadResults.successful.slice(0, 3).map((result, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText 
                    primary={`${result.transaction.reservationId} - ${result.transaction.destination}`}
                    secondary={`$${result.transaction.amount} - ${result.transaction.airline}`}
                  />
                  <Chip label="✓" color="success" size="small" />
                </ListItem>
              ))}
              {uploadResults.successful.length > 3 && (
                <ListItem sx={{ py: 0 }}>
                  <ListItemText 
                    primary={`... y ${uploadResults.successful.length - 3} más`}
                    secondary="Ver la lista completa en la página de pagos"
                  />
                </ListItem>
              )}
            </List>
          </Alert>
        )}

        {uploadResults.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Errores en la carga: {uploadResults.errors.length}
            </Typography>
            <List dense>
              {uploadResults.errors.slice(0, 3).map((error, index) => (
                <ListItem key={index} sx={{ py: 0 }}>
                  <ListItemText 
                    primary={`${error.transaction.reservationId} - ${error.transaction.destination}`}
                    secondary={error.error}
                  />
                  <Chip label="✗" color="error" size="small" />
                </ListItem>
              ))}
              {uploadResults.errors.length > 3 && (
                <ListItem sx={{ py: 0 }}>
                  <ListItemText 
                    primary={`... y ${uploadResults.errors.length - 3} errores más`}
                  />
                </ListItem>
              )}
            </List>
          </Alert>
        )}

        {/* Preview of Mock Data */}
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Vista previa de los datos a cargar:
        </Typography>
        <List dense>
          {mockTransactions.slice(0, 3).map((transaction) => (
            <ListItem key={transaction.id} sx={{ py: 0 }}>
              <ListItemText 
                primary={`${transaction.reservationId} - ${transaction.destination}`}
                secondary={`${transaction.airline} | $${transaction.amount} | ${transaction.status}`}
              />
            </ListItem>
          ))}
          <ListItem sx={{ py: 0 }}>
            <ListItemText 
              primary={`... y ${mockTransactions.length - 3} transacciones más`}
              secondary="Todas incluyen información detallada de vuelos"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default CreatePaymentPage;
