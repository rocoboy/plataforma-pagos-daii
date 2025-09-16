import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PaymentCreationForm from '../components/PaymentCreationForm';

const DevPaymentCreator: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/transactions')}
            variant="outlined"
            size="small"
          >
            Volver a Transacciones
          </Button>
        </Box>
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
              
              <PaymentCreationForm 
                submitButtonText="Crear Pago"
                resetFormOnSuccess={true}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Information Section */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información del Sistema
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Esta interfaz utiliza el endpoint existente <code>/api/webhooks/payments</code> para crear pagos.
                  Los pagos se crean con estado PENDING por defecto y pueden ser actualizados posteriormente desde la tabla de transacciones.
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Estados disponibles:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'text.secondary' }}>
                  <li><Typography variant="body2" color="text.secondary">PENDING - Pago pendiente de procesamiento</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">SUCCESS - Pago procesado exitosamente</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">FAILURE - Pago falló</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">UNDERPAID - Pago insuficiente</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">OVERPAID - Pago en exceso</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">EXPIRED - Pago expirado</Typography></li>
                  <li><Typography variant="body2" color="text.secondary">REFUND - Pago reembolsado</Typography></li>
                </ul>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Endpoint utilizado:</strong> POST /api/webhooks/payments
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default DevPaymentCreator;