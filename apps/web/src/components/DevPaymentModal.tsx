import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { PaymentRow } from '../lib/apiClient';

const currencies = [
  { value: 'ARS', label: 'ARS - Peso Argentino' },
  { value: 'USD', label: 'USD - Dólar Estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
];

interface CreatePaymentResponse {
  success: boolean;
  payment?: PaymentRow;
  error?: string;
  issues?: any;
  // Store form data for display purposes
  formData?: {
    res_id: string;
    user_id: string;
    amount: string;
    currency: string;
  };
}

interface DevPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentCreated?: () => void;
}

const DevPaymentModal: React.FC<DevPaymentModalProps> = ({ 
  open, 
  onClose, 
  onPaymentCreated 
}) => {
  const [formData, setFormData] = useState({
    res_id: '',
    user_id: '',
    amount: '',
    currency: 'ARS',
    meta: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreatePaymentResponse | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Clear previous result when user starts typing
    if (result) setResult(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Validate required fields
      if (!formData.res_id || !formData.user_id || !formData.amount) {
        setResult({
          success: false,
          error: 'Por favor complete todos los campos requeridos'
        });
        return;
      }

      // Validate amount is a positive number
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setResult({
          success: false,
          error: 'El monto debe ser un número positivo'
        });
        return;
      }

      const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/webhooks/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          res_id: formData.res_id,
          user_id: formData.user_id,
          amount: amount,
          currency: formData.currency,
          status: 'PENDING',
          meta: formData.meta || '{}',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreatePaymentResponse = await response.json();
      
      if (data.success) {
        // Store form data before resetting for display purposes
        const successResult = {
          ...data,
          formData: {
            res_id: formData.res_id,
            user_id: formData.user_id,
            amount: formData.amount,
            currency: formData.currency,
          }
        };
        setResult(successResult);
        
        // Reset form on success
        setFormData({
          res_id: '',
          user_id: '',
          amount: '',
          currency: 'ARS',
          meta: '',
        });
        
        // Notify parent component to refresh data
        if (onPaymentCreated) {
          onPaymentCreated();
        }
      } else {
        setResult(data);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form and result when closing
    setFormData({
      res_id: '',
      user_id: '',
      amount: '',
      currency: 'ARS',
      meta: '',
    });
    setResult(null);
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon color="primary" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Crear Pago de Prueba
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="ID de Reserva"
            value={formData.res_id}
            onChange={handleInputChange('res_id')}
            required
            fullWidth
            placeholder="Ej: 25"
            helperText="Identificador único de la reserva"
          />

          <TextField
            label="ID de Usuario"
            value={formData.user_id}
            onChange={handleInputChange('user_id')}
            required
            fullWidth
            placeholder="Ej: 42"
            helperText="Identificador del usuario que realiza el pago"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              required
              fullWidth
              placeholder="Ej: 2000"
              helperText="Monto del pago"
              inputProps={{ min: "0", step: "0.01" }}
            />

            <TextField
              select
              label="Moneda"
              value={formData.currency}
              onChange={handleInputChange('currency')}
              sx={{ minWidth: 150 }}
              helperText="Tipo de moneda"
            >
              {currencies.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            label="Metadatos (Opcional)"
            value={formData.meta}
            onChange={handleInputChange('meta')}
            fullWidth
            placeholder='Ej: {"descripcion": "Pago de prueba"}'
            helperText="JSON con información adicional del pago"
            multiline
            rows={2}
          />

          {/* Result Display */}
          {result && (
            <Alert 
              severity={result.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
              action={
                result.success ? (
                  <Button color="inherit" size="small" onClick={handleSuccessClose}>
                    Cerrar
                  </Button>
                ) : undefined
              }
            >
              {result.success ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    ¡Pago creado exitosamente!
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID:</strong> {result.payment?.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID de Reserva:</strong> {result.formData?.res_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>ID de Usuario:</strong> {result.formData?.user_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estado:</strong> PENDIENTE
                  </Typography>
                  <Typography variant="body2">
                    <strong>Monto:</strong> {result.formData?.currency} {result.formData?.amount}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Error al crear el pago
                  </Typography>
                  <Typography variant="body2">
                    {result.error}
                  </Typography>
                  {result.issues && (
                    <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
                      Detalles: {JSON.stringify(result.issues, null, 2)}
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? undefined : <AddIcon />}
        >
          {loading ? 'Creando...' : 'Crear Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DevPaymentModal;