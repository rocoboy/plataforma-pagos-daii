// Test script for payment processing endpoint
const API_BASE_URL = 'http://localhost:3000/api';

async function testPaymentFlow() {
  const createdPaymentIds = []; // Track created payments for cleanup

  try {
    console.log('🔄 Testing Payment Processing Flow...\n');

    // Step 1: Create a payment first
    console.log('1️⃣ Creating a test payment...');
    const createPaymentResponse = await fetch(`${API_BASE_URL}/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        res_id: `test-reservation-${Date.now()}-1`, // Unique ID with timestamp
        user_id: 'test-user-456',
        amount: 100.50,
        currency: 'ARS',
        meta: {
          description: 'Test payment for checkout flow'
        }
      })
    });

    if (!createPaymentResponse.ok) {
      throw new Error(`Failed to create payment: ${createPaymentResponse.status}`);
    }

    const { payment } = await createPaymentResponse.json();
    createdPaymentIds.push(payment.id); // Track for cleanup
    console.log(`✅ Payment created with ID: ${payment.id}`);
    console.log(`   Status: ${payment.status}`);
    console.log(`   Amount: ${payment.amount} ${payment.currency}\n`);

    // Step 2: Process the payment (success case)
    console.log('2️⃣ Processing payment (success case)...');
    const processPaymentResponse = await fetch(`${API_BASE_URL}/payments/${payment.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardNumber: '4111111111111111', // Valid test card
        cardHolder: 'John Doe',
        cvv: '123',
        expiryMonth: '12',
        expiryYear: '2025'
      })
    });

    if (!processPaymentResponse.ok) {
      const errorText = await processPaymentResponse.text();
      throw new Error(`Failed to process payment: ${processPaymentResponse.status} - ${errorText}`);
    }

    const processResult = await processPaymentResponse.json();
    console.log(`✅ Payment processed successfully!`);
    console.log(`   Status: ${processResult.status}`);
    console.log(`   Transaction ID: ${processResult.transaction_id}`);
    console.log(`   Payment Status: ${processResult.payment.status} (should be SUCCESS)\n`);

    // Step 3: Create another payment for failure test
    console.log('3️⃣ Creating payment for failure test...');
    const createPayment2Response = await fetch(`${API_BASE_URL}/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        res_id: `test-reservation-${Date.now()}-2`, // Unique ID with timestamp
        user_id: 'test-user-789',
        amount: 15000, // Amount over limit
        currency: 'ARS'
      })
    });

    const { payment: payment2 } = await createPayment2Response.json();
    createdPaymentIds.push(payment2.id); // Track for cleanup
    console.log(`✅ Second payment created with ID: ${payment2.id}\n`);

    // Step 4: Process payment (failure case)
    console.log('4️⃣ Processing payment (failure case - high amount)...');
    const processPayment2Response = await fetch(`${API_BASE_URL}/payments/${payment2.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardNumber: '4111111111111111',
        cardHolder: 'Jane Smith',
        cvv: '456',
        expiryMonth: '06',
        expiryYear: '2026'
      })
    });

    const processResult2 = await processPayment2Response.json();
    console.log(`❌ Payment processing result (should be rejected):`);
    console.log(`   Status: ${processResult2.status}`);
    console.log(`   Success: ${processResult2.success}`);
    console.log(`   Payment Status: ${processResult2.payment?.status || 'N/A'} (should be FAILURE)`);
    console.log(`   Error: ${processResult2.error || 'None'}\n`);

    // Step 5: Test with invalid card
    console.log('5️⃣ Creating payment for card decline test...');
    const createPayment3Response = await fetch(`${API_BASE_URL}/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        res_id: `test-reservation-${Date.now()}-3`, // Unique ID with timestamp
        user_id: 'test-user-101',
        amount: 50.00,
        currency: 'ARS'
      })
    });

    const { payment: payment3 } = await createPayment3Response.json();
    createdPaymentIds.push(payment3.id); // Track for cleanup
    console.log(`✅ Third payment created with ID: ${payment3.id}\n`);

    console.log('6️⃣ Processing payment (card decline test)...');
    const processPayment3Response = await fetch(`${API_BASE_URL}/payments/${payment3.id}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardNumber: '4111111111110000', // Card ending in 0000 (decline test)
        cardHolder: 'Bob Wilson',
        cvv: '789',
        expiryMonth: '03',
        expiryYear: '2027'
      })
    });

    const processResult3 = await processPayment3Response.json();
    console.log(`❌ Payment processing result (card declined):`);
    console.log(`   Status: ${processResult3.status}`);
    console.log(`   Success: ${processResult3.success}`);
    console.log(`   Payment Status: ${processResult3.payment?.status || 'N/A'} (should be FAILURE)`);
    console.log(`   Error: ${processResult3.error || 'None'}\n`);

    console.log('🎉 Payment flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup: Delete test payments
    if (createdPaymentIds.length > 0) {
      console.log('\n🧹 Cleaning up test payments...');
      
      for (const paymentId of createdPaymentIds) {
        try {
          const deleteResponse = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (deleteResponse.ok) {
            console.log(`✅ Deleted payment: ${paymentId}`);
          } else {
            console.log(`⚠️  Could not delete payment: ${paymentId} (status: ${deleteResponse.status})`);
          }
        } catch (deleteError) {
          console.log(`⚠️  Could not delete payment: ${paymentId} (${deleteError.message})`);
        }
      }
      
      console.log('🧹 Cleanup completed!\n');
    }
  }
}

// Run the test
testPaymentFlow();