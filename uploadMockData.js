const fetch = require('node-fetch');

// Mock data (copied from your mockData.ts)
const mockTransactions = [
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

const mockTransactionDetails = {
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

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Transform mock data to match Supabase schema
function transformTransactionToPayment(transaction, detail) {
  const statusMapping = {
    'confirmado': 'SUCCESS',
    'pendiente': 'PENDING', 
    'cancelado': 'FAILURE'
  };

  // Store all flight and transaction details in meta field
  const meta = {
    destination: transaction.destination,
    airline: transaction.airline,
    purchaseDate: transaction.purchaseDate,
    originalStatus: transaction.status,
    ...(detail && {
      paymentMethod: detail.paymentMethod,
      cardNumber: detail.cardNumber,
      flightNumber: detail.flightNumber,
      departure: detail.departure,
      arrival: detail.arrival,
      duration: detail.duration,
      flightClass: detail.flightClass
    })
  };

  return {
    res_id: transaction.reservationId,
    amount: transaction.amount,
    currency: 'USD',
    user_id: `user_${transaction.id}`,
    meta
  };
}

// Upload a single payment
async function uploadPayment(paymentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${error.error || 'Upload failed'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading payment:', error);
    throw error;
  }
}

// Check if backend is running
async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments`);
    if (response.ok) {
      console.log('✅ Backend connection successful');
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend:', error.message);
    return false;
  }
}

// Upload all mock data
async function uploadAllMockData() {
  console.log('Starting mock data upload...');
  
  const results = [];
  const errors = [];

  for (const transaction of mockTransactions) {
    try {
      // Get corresponding detail if available
      const detail = mockTransactionDetails[transaction.id];
      
      // Transform data to match backend schema
      const paymentData = transformTransactionToPayment(transaction, detail);
      
      console.log(`Uploading transaction ${transaction.id} (${transaction.reservationId})...`);
      
      // Upload to backend
      const result = await uploadPayment(paymentData);
      results.push(result);
      
      console.log(`✅ Successfully uploaded transaction ${transaction.id}`);
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMsg = `❌ Failed to upload transaction ${transaction.id}: ${error.message}`;
      console.error(errorMsg);
      errors.push({ transactionId: transaction.id, error: errorMsg });
    }
  }

  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successful uploads: ${results.length}`);
  console.log(`❌ Failed uploads: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => console.log(`  - ${err.error}`));
  }

  return {
    successful: results,
    errors,
    totalProcessed: mockTransactions.length
  };
}

// Main function
async function main() {
  console.log('🚀 Mock Data Upload Script');
  console.log('==========================\n');
  console.log(`Target API: ${API_BASE_URL}\n`);

  // Check backend connection first
  console.log('Checking backend connection...');
  const isConnected = await checkBackendConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot connect to backend. Please ensure:');
    console.log('1. Your backend server is running');
    console.log('2. The API_BASE_URL is correct');
    console.log('3. No firewall is blocking the connection');
    console.log(`\nCurrent API_BASE_URL: ${API_BASE_URL}`);
    console.log('You can set a different URL with: API_URL=http://your-api-url node uploadMockData.js');
    return;
  }

  // Proceed with upload
  console.log('\n🔄 Starting upload process...\n');
  const results = await uploadAllMockData();
  
  console.log('\n🎉 Upload process completed!');
  return results;
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadAllMockData, checkBackendConnection };
