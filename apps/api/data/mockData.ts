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

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    reservationId: 'BKG123456',
    destination: 'New York',
    airline: 'Delta',
    purchaseDate: '2025-09-01',
    status: 'confirmado',
    amount: 350.00
  },
  {
    id: '2',
    reservationId: 'BKG789012',
    destination: 'Los Angeles',
    airline: 'American Airlines',
    purchaseDate: '2025-08-15',
    status: 'pendiente',
    amount: 420.00
  },
  {
    id: '3',
    reservationId: 'BKG345678',
    destination: 'Chicago',
    airline: 'United Airlines',
    purchaseDate: '2025-07-23',
    status: 'cancelado',
    amount: 550.00
  },
  {
    id: '4',
    reservationId: 'BKG456789',
    destination: 'Miami',
    airline: 'Delta',
    purchaseDate: '2025-09-02',
    status: 'confirmado',
    amount: 280.00
  },
  {
    id: '5',
    reservationId: 'BKG567890',
    destination: 'Seattle',
    airline: 'Alaska Airlines',
    purchaseDate: '2025-08-20',
    status: 'pendiente',
    amount: 380.00
  },
  {
    id: '6',
    reservationId: 'BKG678901',
    destination: 'Boston',
    airline: 'JetBlue',
    purchaseDate: '2025-09-03',
    status: 'confirmado',
    amount: 290.00
  },
  {
    id: '7',
    reservationId: 'BKG789013',
    destination: 'San Francisco',
    airline: 'United Airlines',
    purchaseDate: '2025-08-28',
    status: 'pendiente',
    amount: 410.00
  }
];

// Mock detailed transaction data
export const mockTransactionDetails: Record<string, TransactionDetail> = {
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
  },
  '6': {
    id: '6',
    reservationId: '#BKG678901',
    purchaseDate: '3 de Septiembre, 2025',
    amount: 290.00,
    paymentMethod: 'Tarjeta de Débito',
    cardNumber: '**** 5678',
    flightNumber: 'B6-1894',
    departure: 'New York (JFK) - 09:30 AM',
    arrival: 'Boston (BOS) - 10:45 AM',
    duration: '1h 15m',
    flightClass: 'Economy'
  },
  '7': {
    id: '7',
    reservationId: '#BKG789013',
    purchaseDate: '28 de Agosto, 2025',
    amount: 410.00,
    paymentMethod: 'PayPal',
    cardNumber: '**** 1234',
    flightNumber: 'UA-6677',
    departure: 'Chicago (ORD) - 01:15 PM',
    arrival: 'San Francisco (SFO) - 03:30 PM',
    duration: '4h 15m',
    flightClass: 'Business'
  }
};
