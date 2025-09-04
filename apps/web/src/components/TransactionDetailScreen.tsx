import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Types
interface TransactionDetail {
  id: string;
  reservationId: string;
  purchaseDate: string;
  amount: number;
  paymentMethod: string;
  cardNumber: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  flightClass: string;
}

// Mock detailed transaction data - multiple transactions
const mockTransactionDetails: Record<string, TransactionDetail> = {
  '1': {
    id: '1',
    reservationId: '#BKG123456',
    purchaseDate: '1 de Septiembre, 2025',
    amount: 350.00,
    paymentMethod: 'Tarjeta de Crédito',
    cardNumber: '**** 4532',
    flightNumber: 'DL-2847',
    departure: 'Miami (MIA) - 08:30 AM',
    arrival: 'New York (JFK) - 11:45 AM',
    duration: '3h 15m',
    flightClass: 'Economy'
  },
  '2': {
    id: '2',
    reservationId: '#BKG789012',
    purchaseDate: '15 de Agosto, 2025',
    amount: 420.00,
    paymentMethod: 'Tarjeta de Débito',
    cardNumber: '**** 8971',
    flightNumber: 'AA-1205',
    departure: 'Chicago (ORD) - 02:20 PM',
    arrival: 'Los Angeles (LAX) - 04:35 PM',
    duration: '4h 15m',
    flightClass: 'Business'
  },
  '3': {
    id: '3',
    reservationId: '#BKG345678',
    purchaseDate: '23 de Julio, 2025',
    amount: 550.00,
    paymentMethod: 'PayPal',
    cardNumber: '**** 2341',
    flightNumber: 'UA-8834',
    departure: 'San Francisco (SFO) - 11:10 AM',
    arrival: 'Chicago (ORD) - 05:25 PM',
    duration: '4h 15m',
    flightClass: 'First Class'
  },
  '4': {
    id: '4',
    reservationId: '#BKG456789',
    purchaseDate: '2 de Septiembre, 2025',
    amount: 280.00,
    paymentMethod: 'Tarjeta de Crédito',
    cardNumber: '**** 7629',
    flightNumber: 'DL-5012',
    departure: 'New York (LGA) - 07:45 AM',
    arrival: 'Miami (MIA) - 10:50 AM',
    duration: '3h 05m',
    flightClass: 'Economy'
  },
  '5': {
    id: '5',
    reservationId: '#BKG567890',
    purchaseDate: '20 de Agosto, 2025',
    amount: 380.00,
    paymentMethod: 'Tarjeta de Crédito',
    cardNumber: '**** 9483',
    flightNumber: 'AS-2156',
    departure: 'Los Angeles (LAX) - 06:15 PM',
    arrival: 'Seattle (SEA) - 08:45 PM',
    duration: '2h 30m',
    flightClass: 'Premium Economy'
  }
};

interface TransactionDetailScreenProps {
  transactionId?: string;
  onBack?: () => void;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ 
  transactionId, 
  onBack 
}) => {
  // Fetch transaction detail using TanStack Query
  const { data: transactionDetail, isLoading, error } = useQuery({
    queryKey: ['transactionDetail', transactionId],
    queryFn: async (): Promise<TransactionDetail> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get transaction detail by ID, fallback to first one if not found
      const detail = transactionId ? mockTransactionDetails[transactionId] : null;
      if (!detail) {
        throw new Error('Transacción no encontrada');
      }
      
      return detail;
    },
    enabled: !!transactionId
  });

  const handleDownloadInvoice = () => {
    console.log('Downloading invoice for transaction:', transactionId);
    // TODO: Implement download invoice functionality
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-md text-muted-foreground">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !transactionDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <p className="text-body-md text-destructive mb-4">Error al cargar los detalles</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 text-body-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-roboto">
      {/* Main Content Container */}
      <div className="bg-background shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Volver"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-heading-lg text-foreground">Historial de Transacciones</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Transaction Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Transaction Details Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-heading-md text-primary font-bold">Detalles de la transacción</h2>
              <button
                onClick={handleDownloadInvoice}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-body-sm font-medium"
              >
                Descargar Factura
              </button>
            </div>
            
            {/* Transaction Details Section */}
            <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">ID Reserva</span>
                  <span className="text-body-md text-foreground font-medium">{transactionDetail.reservationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Fecha</span>
                  <span className="text-body-md text-foreground">{transactionDetail.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Monto</span>
                  <span className="text-body-md text-foreground font-medium">${transactionDetail.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Medio de pago</span>
                  <div className="text-right">
                    <div className="text-body-md text-foreground">{transactionDetail.paymentMethod}</div>
                    <div className="text-body-sm text-muted-foreground">{transactionDetail.cardNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details Header */}
            <h2 className="text-heading-md text-primary font-bold">Detalles del Vuelo</h2>

            {/* Flight Details Section */}
            <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Número de vuelo</span>
                  <span className="text-body-md text-foreground font-medium">{transactionDetail.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Salida</span>
                  <span className="text-body-md text-foreground">{transactionDetail.departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Llegada</span>
                  <span className="text-body-md text-foreground">{transactionDetail.arrival}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Duración</span>
                  <span className="text-body-md text-foreground">{transactionDetail.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Clase</span>
                  <span className="text-body-md text-foreground">{transactionDetail.flightClass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Airplane Image */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden h-96 lg:h-full min-h-[400px] relative">
              {/* Airplane silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-32 h-32 text-black/30 transform rotate-45" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              
              {/* Cloud elements */}
              <div className="absolute bottom-20 left-8">
                <div className="w-16 h-8 bg-white/20 rounded-full"></div>
                <div className="w-12 h-6 bg-white/15 rounded-full ml-4 -mt-3"></div>
              </div>
              
              <div className="absolute top-32 right-12">
                <div className="w-20 h-10 bg-white/25 rounded-full"></div>
                <div className="w-14 h-7 bg-white/20 rounded-full ml-6 -mt-4"></div>
              </div>
              
              <div className="absolute bottom-32 right-6">
                <div className="w-12 h-6 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Close Main Content Container */}
      </div>
    </div>
  );
};

export default TransactionDetailScreen;
