// Check existing payments in database
const API_BASE_URL = 'http://localhost:3001/api';

async function checkExistingPayments() {
  try {
    console.log('🔍 Checking existing payments in database...\n');
    
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Existing payments:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.payments && result.payments.length > 0) {
      console.log(`\n📊 Found ${result.payments.length} existing payments`);
      result.payments.forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id}, res_id: ${payment.res_id}, Status: ${payment.status}, Amount: ${payment.amount}`);
      });
    } else {
      console.log('\n📊 No payments found in database');
    }

  } catch (error) {
    console.error('❌ Failed to check payments:', error.message);
  }
}

// Run the check
checkExistingPayments();