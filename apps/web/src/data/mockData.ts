// Types
export interface Transaction {
  id: string;
  reservationId: string;
  destination: string;
  airline: string;
  purchaseDate: string;
  status: 'confirmado' | 'pendiente' | 'cancelado';
  amount: number;
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
