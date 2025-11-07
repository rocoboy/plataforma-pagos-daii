#!/usr/bin/env node

/**
 * Test script to send messages to RabbitMQ for testing the bridge service
 * Usage: node test-sender.js
 */

const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672/';
const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'payments';
const QUEUE = process.env.RABBITMQ_QUEUE || 'payment-events';

async function sendTestMessages() {
  try {
    console.log('Connecting to RabbitMQ...');
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    // Test messages
    const testMessages = [
      {
        routingKey: 'payment.completed',
        data: {
          paymentId: 'pay_123456789',
          amount: 2999,
          currency: 'USD',
          customerId: 'cust_123',
          timestamp: new Date().toISOString(),
        }
      },
      {
        routingKey: 'payment.failed',
        data: {
          paymentId: 'pay_987654321',
          amount: 1999,
          currency: 'USD',
          customerId: 'cust_456',
          error: 'Insufficient funds',
          timestamp: new Date().toISOString(),
        }
      },
      {
        routingKey: 'user.created',
        data: {
          userId: 'user_789',
          email: 'test@example.com',
          name: 'Test User',
          timestamp: new Date().toISOString(),
        }
      },
      {
        routingKey: 'subscription.created',
        data: {
          subscriptionId: 'sub_123',
          userId: 'user_789',
          planId: 'plan_premium',
          status: 'active',
          timestamp: new Date().toISOString(),
        }
      }
    ];

    console.log(`Sending ${testMessages.length} test messages...`);

    for (const message of testMessages) {
      const messageBuffer = Buffer.from(JSON.stringify(message.data));
      
      await channel.publish(
        EXCHANGE,
        message.routingKey,
        messageBuffer,
        {
          messageId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          headers: {
            'x-test': true,
            'x-source': 'test-sender'
          }
        }
      );

      console.log(`✓ Sent message: ${message.routingKey}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between messages
    }

    console.log('All test messages sent successfully!');
    
    await channel.close();
    await connection.close();
    
  } catch (error) {
    console.error('Error sending test messages:', error);
    process.exit(1);
  }
}

// Run the test
sendTestMessages();
