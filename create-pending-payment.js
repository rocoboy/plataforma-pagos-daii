const API_BASE_URL = 'http://localhost:3000';

async function createPendingPayment() {
  try {
    console.log('Creating a PENDING payment for testing...');
    
    const mockFlightData = {
      destination: 'Paris (CDG)',
      airline: 'Air France',
      flightNumber: 'AF1234',
      departure: 'Buenos Aires (EZE)',
      arrival: 'Paris (CDG)',
      duration: '13h 45m',
      flightClass: 'Economy',
      paymentMethod: 'Credit Card'
    };

    const createRequest = {
      res_id: `RES-${Date.now()}`,
      amount: 850,
      currency: 'USD',
      meta: mockFlightData
    };

    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createRequest),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ PENDING payment created successfully:');
      console.log(`Payment ID: ${result.data.id}`);
      console.log(`Reservation ID: ${result.data.res_id}`);
      console.log(`Amount: $${result.data.amount}`);
      console.log(`Status: ${result.data.status}`);
      console.log('\nNow you can use the frontend to pay this pending payment!');
    } else {
      console.error('❌ Failed to create payment:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createPendingPayment();