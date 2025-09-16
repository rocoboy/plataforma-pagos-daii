import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import PaymentCreationForm from './PaymentCreationForm';

interface DevPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentCreated?: () => void;
}

const DevPaymentModal: React.FC<DevPaymentModalProps> = ({
  open,
  onClose,
  onPaymentCreated,
}) => {
  const handlePaymentCreated = () => {
    if (onPaymentCreated) {
      onPaymentCreated();
    }
    // Don't auto-close the modal to let user see the success message
    // They can close it manually
  };

  const handleClose = () => {
    onClose();
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
        <PaymentCreationForm 
          onPaymentCreated={handlePaymentCreated}
          showTitle={true}
          submitButtonText="Crear Pago"
          resetFormOnSuccess={false}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={handleClose} color="secondary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DevPaymentModal;