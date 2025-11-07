import React, { useState } from 'react';
import { PaymentRow } from '../lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Plus } from 'lucide-react';

const currencies = [
  { value: 'ARS', label: 'ARS - Peso Argentino' },
];

interface CreatePaymentResponse {
  success: boolean;
  payment?: PaymentRow;
  error?: string;
  issues?: any;
  formData?: {
    res_id: string;
    user_id: string;
    amount: string;
    currency: string;
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
    currency: 'ARS',
    meta: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreatePaymentResponse | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (result) setResult(null);
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
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
          currency: formData.currency,
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
            currency: formData.currency,
          }
        };
        setResult(successResult);
        
        if (resetFormOnSuccess) {
          setFormData({
            res_id: '',
            user_id: '',
            amount: '',
            currency: 'ARS',
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
    <div className="space-y-6">
      {showTitle && (
        <p className="text-sm text-muted-foreground">
          Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="res_id">ID de Reserva</Label>
          <Input
            id="res_id"
            value={formData.res_id}
            onChange={handleInputChange('res_id')}
            required
            placeholder="Ej: BKG123456"
          />
          <p className="text-xs text-muted-foreground">Identificador único de la reserva</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="user_id">ID de Usuario</Label>
          <Input
            id="user_id"
            value={formData.user_id}
            onChange={handleInputChange('user_id')}
            required
            placeholder="Ej: user_123"
          />
          <p className="text-xs text-muted-foreground">Identificador del usuario que realiza el pago</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              required
              placeholder="Ej: 100.50"
              step="0.01"
              min="0"
            />
            <p className="text-xs text-muted-foreground">Monto del pago</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select value={formData.currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Tipo de moneda</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meta">Metadatos (Opcional)</Label>
          <textarea
            id="meta"
            value={formData.meta}
            onChange={handleInputChange('meta')}
            placeholder='Ej: {"descripcion": "Pago de prueba"}'
            rows={2}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">JSON con información adicional del pago</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            'Creando...'
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              {submitButtonText}
            </>
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? 'success' : 'destructive'}>
            <AlertTitle className="font-semibold">
              {result.success ? '¡Pago creado exitosamente!' : 'Error al crear el pago'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              {result.success ? (
                <>
                  <p className="text-sm"><strong>ID:</strong> {result.payment?.id}</p>
                  <p className="text-sm"><strong>ID de Reserva:</strong> {result.formData?.res_id}</p>
                  <p className="text-sm"><strong>ID de Usuario:</strong> {result.formData?.user_id}</p>
                  <p className="text-sm"><strong>Estado:</strong> PENDIENTE</p>
                  <p className="text-sm"><strong>Monto:</strong> {result.formData?.currency} {result.formData?.amount}</p>
                </>
              ) : (
                <>
                  <p className="text-sm">{result.error}</p>
                  {result.issues && (
                    <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(result.issues, null, 2)}</pre>
                  )}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
};

export default PaymentCreationForm;
