// Shared payment creation form component
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { PaymentRow } from '../lib/apiClient';

interface CreatePaymentResponse {
  success: boolean;
  payment?: PaymentRow;
  error?: string;
  issues?: any;
  formData?: {
    res_id: string;
    user_id: string;
    amount: string;
  };
}

interface PaymentCreationFormProps {
  onPaymentCreated?: () => void;
  showTitle?: boolean;
  submitButtonText?: string;
  resetFormOnSuccess?: boolean;
}

const PaymentCreationForm: React.FC<PaymentCreationFormProps> = ({
  onPaymentCreated,
  showTitle = true,
  submitButtonText = 'Crear Pago',
  resetFormOnSuccess = true,
}) => {
  const [formData, setFormData] = useState({
    res_id: '',
    user_id: '',
    amount: '',
    meta: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreatePaymentResponse | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (result) setResult(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (!formData.res_id || !formData.user_id || !formData.amount) {
        setResult({
          success: false,
          error: 'Por favor complete todos los campos requeridos'
        });
        return;
      }

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
          currency: 'ARS',
          meta: formData.meta || '{}',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CreatePaymentResponse = await response.json();
      
      if (data.success) {
        const successResult = {
          ...data,
          formData: {
            res_id: formData.res_id,
            user_id: formData.user_id,
            amount: formData.amount,
          }
        };
        setResult(successResult);
        
        if (resetFormOnSuccess) {
          setFormData({
            res_id: '',
            user_id: '',
            amount: '',
            meta: '',
          });
        }
        
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

  return (
    <Box>
      {showTitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE. La moneda será ARS por defecto.
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="ID de Reserva"
          value={formData.res_id}
          onChange={handleInputChange('res_id')}
          required
          fullWidth
          placeholder="Ej: BKG123456"
          helperText="Identificador único de la reserva"
        />

        <TextField
          label="ID de Usuario"
          value={formData.user_id}
          onChange={handleInputChange('user_id')}
          required
          fullWidth
          placeholder="Ej: user_123"
          helperText="Identificador del usuario que realiza el pago"
        />

        <TextField
          label="Monto (ARS)"
          type="number"
          value={formData.amount}
          onChange={handleInputChange('amount')}
          required
          fullWidth
          placeholder="Ej: 100.50"
          helperText="Monto del pago en pesos argentinos"
          inputProps={{ min: "0", step: "0.01" }}
        />

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

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? undefined : <AddIcon />}
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Creando...' : submitButtonText}
        </Button>

        {result && (
          <Alert 
            severity={result.success ? 'success' : 'error'}
            sx={{ mt: 2 }}
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
                  <strong>Monto:</strong> ARS {result.formData?.amount}
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
    </Box>
  );
};

export default PaymentCreationForm;
