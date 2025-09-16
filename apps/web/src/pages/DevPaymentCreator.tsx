import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
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
}

const DevPaymentCreator: React.FC = () => {
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
      // Prepare the payload
      const payload: any = {
        amount: parseFloat(formData.amount),
      };

      if (formData.res_id.trim()) {
        payload.res_id = formData.res_id.trim();
      }

      if (formData.user_id.trim()) {
        payload.user_id = formData.user_id.trim();
      }

      if (formData.currency) {
        payload.currency = formData.currency;
      }

      if (formData.meta.trim()) {
        try {
          payload.meta = JSON.parse(formData.meta);
        } catch {
          payload.meta = formData.meta; // If not valid JSON, send as string
        }
      }

      // Use the existing webhook endpoint
      const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/webhooks/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      res_id: '',
      user_id: '',
      amount: '',
      currency: 'ARS',
      meta: '',
    });
    setResult(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Creador de Pagos - Desarrollo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Esta página permite crear pagos para pruebas usando los métodos existentes del backend.
          Los pagos se crean con estado PENDING por defecto.
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Form */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crear Nuevo Pago
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                  label="Monto"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  fullWidth
                  required
                  margin="normal"
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Monto del pago (requerido)"
                />

                <TextField
                  label="ID de Recurso"
                  value={formData.res_id}
                  onChange={handleInputChange('res_id')}
                  fullWidth
                  margin="normal"
                  helperText="Identificador del recurso/reserva (opcional)"
                />

                <TextField
                  label="ID de Usuario"
                  value={formData.user_id}
                  onChange={handleInputChange('user_id')}
                  fullWidth
                  margin="normal"
                  helperText="Identificador del usuario (opcional)"
                />

                <TextField
                  select
                  label="Moneda"
                  value={formData.currency}
                  onChange={handleInputChange('currency')}
                  fullWidth
                  margin="normal"
                  helperText="Moneda del pago"
                >
                  {currencies.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Metadata"
                  value={formData.meta}
                  onChange={handleInputChange('meta')}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  helperText="Datos adicionales en formato JSON o texto (opcional)"
                />

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !formData.amount}
                    sx={{ flexGrow: 1 }}
                  >
                    {loading ? 'Creando...' : 'Crear Pago'}
                  </Button>
                  
                  <Button
                    variant="text"
                    onClick={clearForm}
                    disabled={loading}
                  >
                    Limpiar
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Result */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resultado
              </Typography>
              
              {result ? (
                <Box sx={{ mt: 2 }}>
                  {result.success ? (
                    <>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ¡Pago creado exitosamente!
                      </Alert>
                      
                      {result.payment && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Detalles del Pago:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                            <Typography variant="body2"><strong>ID:</strong> {result.payment.id}</Typography>
                            <Typography variant="body2"><strong>Monto:</strong> {result.payment.amount} {result.payment.currency}</Typography>
                            <Typography variant="body2"><strong>Estado:</strong> {result.payment.status || 'PENDING'}</Typography>
                            <Typography variant="body2"><strong>Recurso ID:</strong> {result.payment.res_id}</Typography>
                            {result.payment.user_id && (
                              <Typography variant="body2"><strong>Usuario:</strong> {result.payment.user_id}</Typography>
                            )}
                            <Typography variant="body2"><strong>Creado:</strong> {new Date(result.payment.created_at).toLocaleString()}</Typography>
                            {result.payment.meta && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="body2"><strong>Metadata:</strong></Typography>
                                <Paper variant="outlined" sx={{ p: 1, mt: 0.5, backgroundColor: 'white' }}>
                                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {typeof result.payment.meta === 'object' 
                                      ? JSON.stringify(result.payment.meta, null, 2)
                                      : result.payment.meta
                                    }
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Error al crear el pago
                      </Alert>
                      
                      <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'error.light', color: 'error.contrastText' }}>
                        <Typography variant="body2"><strong>Error:</strong> {result.error}</Typography>
                        {result.issues && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2"><strong>Detalles:</strong></Typography>
                            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                              {typeof result.issues === 'string' ? result.issues : JSON.stringify(result.issues, null, 2)}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </>
                  )}
                </Box>
              ) : (
                <Box sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">
                    Complete el formulario y haga clic en "Crear Pago" para ver el resultado aquí.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información Técnica
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Esta interfaz utiliza el endpoint existente <code>/api/webhooks/payments</code> para crear pagos.
          Los pagos se crean con estado PENDING por defecto y pueden ser actualizados posteriormente.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Endpoint utilizado:</strong> POST /api/webhooks/payments
        </Typography>
      </Paper>
    </Box>
  );
};

export default DevPaymentCreator;