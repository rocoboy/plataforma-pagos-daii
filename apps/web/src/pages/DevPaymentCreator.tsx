import React from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentCreationForm from '../components/PaymentCreationForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';

const DevPaymentCreator: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/payments')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Transacciones
            </Button>
          </div>
          <CardTitle className="text-2xl">Creador de Pagos</CardTitle>
          <CardDescription>
            Crea pagos de prueba. Los pagos se crean con estado PENDING por defecto.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentCreationForm 
              submitButtonText="Crear Pago"
              resetFormOnSuccess={true}
            />
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta interfaz utiliza el endpoint existente <code className="bg-muted px-1 py-0.5 rounded">/api/webhooks/payments</code> para crear pagos.
              Los pagos se crean con estado PENDING por defecto y pueden ser actualizados posteriormente desde la tabla de transacciones.
            </p>
            
            <div>
              <p className="text-sm font-semibold mb-2">Estados disponibles:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>PENDING - Pago pendiente de procesamiento</li>
                <li>SUCCESS - Pago procesado exitosamente</li>
                <li>FAILURE - Pago falló</li>
                <li>UNDERPAID - Pago insuficiente</li>
                <li>OVERPAID - Pago en exceso</li>
                <li>EXPIRED - Pago expirado</li>
                <li>REFUND - Pago reembolsado</li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground">
              <strong>Endpoint utilizado:</strong> POST /api/webhooks/payments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DevPaymentCreator;
