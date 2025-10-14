import React from 'react';
import PaymentCreationForm from './PaymentCreationForm';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

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
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-900" />
            <DialogTitle className="text-xl">Crear Pago de Prueba</DialogTitle>
          </div>
        </DialogHeader>
        
        <PaymentCreationForm 
          onPaymentCreated={handlePaymentCreated}
          showTitle={true}
          submitButtonText="Crear Pago"
          resetFormOnSuccess={false}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DevPaymentModal;
