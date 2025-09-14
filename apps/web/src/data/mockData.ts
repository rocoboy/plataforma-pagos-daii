// Types
export interface Transaction {
  id: string;
  reservationId: string;
  destination: string;
  airline: string;
  purchaseDate: string;
  status: 'confirmado' | 'pendiente' | 'cancelado' | 'pago-parcial';
  amount: number;
  originalStatus?: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'UNDERPAID' | 'OVERPAID' | 'EXPIRED' | 'REFUND'; // For payment button logic
}

export interface TransactionDetail {
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
