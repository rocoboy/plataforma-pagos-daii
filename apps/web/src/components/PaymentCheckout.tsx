import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Payment form data interface
interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

// Component props
interface PaymentCheckoutProps {
  open: boolean;
  onClose: () => void;
  paymentId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

// Validation functions
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length >= 13 && /^\d+$/.test(cleaned);
};

const validateCVV = (cvv: string): boolean => {
  return cvv.length >= 3 && /^\d+$/.test(cvv);
};

const validateExpiry = (month: string, year: string): boolean => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  return true;
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/.{1,4}/g);
  return match ? match.join(' ') : cleaned;
};

// Generate year options
const generateYearOptions = (): string[] => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let i = 0; i < 10; i++) {
    years.push((currentYear + i).toString());
  }
  return years;
};

// Generate month options
const generateMonthOptions = (): string[] => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return month;
  });
};

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  open,
  onClose,
  paymentId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  // Handle form field changes
  const handleFieldChange = (field: keyof PaymentFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Format card number
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
      if (value.length > 19) return; // Limit to 16 digits + 3 spaces
    }
    
    // Limit CVV length
    if (field === 'cvv' && value.length > 4) return;
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle dropdown changes
  const handleSelectChange = (field: 'expiryMonth' | 'expiryYear') => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    }

    if (!formData.cardHolder.trim() || formData.cardHolder.length < 2) {
      newErrors.cardHolder = 'Nombre del titular requerido';
    }

    if (!validateCVV(formData.cvv)) {
      newErrors.cvv = 'CVV inválido';
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiryMonth = 'Fecha de vencimiento requerida';
    } else if (!validateExpiry(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiryMonth = 'Fecha de vencimiento inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process payment
  const handleProcessPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setPaymentResult({ status: null, message: '' });

    try {
      const response = await fetch(`http://localhost:3000/api/payments/${paymentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolder: formData.cardHolder,
          cvv: formData.cvv,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPaymentResult({
          status: 'success',
          message: `¡Pago procesado exitosamente! ID de transacción: ${result.transaction_id}`,
        });
        setTimeout(() => {
          onPaymentSuccess(result);
          handleClose();
        }, 2000);
      } else {
        setPaymentResult({
          status: 'error',
          message: result.error || 'El pago fue rechazado. Por favor, verifique los datos de su tarjeta.',
        });
        onPaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentResult({
        status: 'error',
        message: 'Error al procesar el pago. Por favor, intente nuevamente.',
      });
      onPaymentError('Network error');
    } finally {
      setProcessing(false);
    }
  };

  // Close dialog and reset form
  const handleClose = () => {
    if (!processing) {
      setFormData({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });
      setErrors({});
      setPaymentResult({ status: null, message: '' });
      onClose();
    }
  };

  // Get test card info for development
  const useTestCard = () => {
    setFormData({
      cardNumber: '4111 1111 1111 1111',
      cardHolder: 'Juan Pérez',
      expiryMonth: '12',
      expiryYear: '2025',
      cvv: '123',
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditCardIcon color="primary" />
          <Typography variant="h6">Procesar Pago</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            ${amount.toFixed(2)} {currency}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Pago ID: {paymentId}
          </Typography>
        </Box>

        {/* Development helper */}
        {process.env.NODE_ENV === 'development' && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={useTestCard}
            sx={{ mb: 2 }}
          >
            Usar tarjeta de prueba
          </Button>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Card Number */}
          <TextField
            fullWidth
            label="Número de Tarjeta"
            value={formData.cardNumber}
            onChange={handleFieldChange('cardNumber')}
            error={!!errors.cardNumber}
            helperText={errors.cardNumber}
            placeholder="1234 5678 9012 3456"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Card Holder */}
          {/* Card Holder */}
          <TextField
            fullWidth
            label="Nombre del Titular"
            value={formData.cardHolder}
            onChange={handleFieldChange('cardHolder')}
            error={!!errors.cardHolder}
            helperText={errors.cardHolder}
            placeholder="Juan Pérez"
          />

          {/* Expiry Date - Flex container for side by side inputs */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth error={!!errors.expiryMonth}>
              <InputLabel>Mes</InputLabel>
              <Select
                value={formData.expiryMonth}
                onChange={handleSelectChange('expiryMonth')}
                label="Mes"
              >
                {generateMonthOptions().map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.expiryYear}>
              <InputLabel>Año</InputLabel>
              <Select
                value={formData.expiryYear}
                onChange={handleSelectChange('expiryYear')}
                label="Año"
              >
                {generateYearOptions().map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* CVV */}
          <TextField
            fullWidth
            label="CVV"
            value={formData.cvv}
            onChange={handleFieldChange('cvv')}
            error={!!errors.cvv}
            helperText={errors.cvv || 'Código de 3 dígitos en el reverso de la tarjeta'}
            placeholder="123"
            type="password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Payment Result */}
        {paymentResult.status && (
          <Box sx={{ mt: 2 }}>
            <Alert 
              severity={paymentResult.status === 'success' ? 'success' : 'error'}
              icon={paymentResult.status === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              {paymentResult.message}
            </Alert>
          </Box>
        )}

        {/* Security Notice */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" display="flex" alignItems="center" gap={0.5}>
            <LockIcon fontSize="small" />
            Sus datos están protegidos con encriptación SSL
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={processing}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleProcessPayment}
          disabled={processing || paymentResult.status === 'success'}
          startIcon={processing ? <CircularProgress size={20} /> : <CreditCardIcon />}
        >
          {processing ? 'Procesando...' : `Pagar $${amount.toFixed(2)} ${currency}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentCheckout;