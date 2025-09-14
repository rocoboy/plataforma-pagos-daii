# Payment Module - Reservas Integration Documentation

## Overview
This document outlines how our Payment Module handles the integration requirements specified by the Reservas module, including all payment lifecycle scenarios.

## Implemented Endpoints

### 1. Payment Creation (Creación de reserva)
**Endpoint:** `POST /api/webhooks/payments`

**Expected Input from Reservas Module:**
```json
{
  "amount": 20000,
  "externalUserId": 5,
  "reservationId": 15,
  "Payment_status": "PENDING",
  "PaymentEventId": 32
}
```

**Our Implementation:**
- Maps `reservationId` → `res_id`
- Maps `externalUserId` → `user_id`
- Creates payment with `PENDING` status
- Stores metadata for tracking
- **Response:** Payment object with assigned ID

### 2. Payment Confirmation (Confirmed Payment)
**Endpoint:** `PUT /api/webhooks/payments`

**Expected Input from Reservas Module:**
```json
{
  "paymentStatus": "SUCCESS",
  "reservationId": 15,
  "externalUserId": 5,
  "paymentEventId": 12
}
```

**Our Implementation:**
- Updates payment status to `SUCCESS`
- Publishes `payment.completed` event to RabbitMQ
- Updates `modified_at` timestamp
- **Event Published:** Confirmation message to Reservas module

### 3. Payment Cancellation (Cancel Reservation)
**Endpoint:** `PATCH /api/webhooks/payments`

**Expected Input from Reservas Module:**
```json
{
  "PaymentEventId": 1,
  "paymentEventId": 123,
  "paymentStatus": "PENDING",
  "amount": 100.00,
  "reservationId": 11,
  "externalUserId": 1
}
```

**Our Implementation:**
- Action: `cancel`
- Updates payment status to `FAILURE`
- Publishes `payment.cancelled` event to RabbitMQ
- Supports cancellation reason tracking
- **Event Published:** Cancellation message to Reservas module

### 4. Payment Refund (Reembolso dado de alta)
**Endpoint:** `PATCH /api/webhooks/payments`

**Expected Input from Reservas Module:**
```json
{
  "PaymentEventId": 56,
  "paymentStatus": "REFUND",
  "reservationId": 11,
  "externalUserId": 1
}
```

**Our Implementation:**
- Action: `refund`
- Updates payment status to `REFUND`
- Publishes `payment.refunded` event to RabbitMQ
- Supports partial refund amounts
- **Event Published:** Refund confirmation to Reservas module

## Supported Payment Statuses

| Status | Description | Event Published |
|--------|-------------|-----------------|
| `PENDING` | Initial payment state | None (initial state) |
| `SUCCESS` | Payment completed | `payment.completed` |
| `FAILURE` | Payment failed/cancelled | `payment.failed` |
| `REFUND` | Payment refunded | `payment.refunded` |
| `EXPIRED` | Payment expired | `payment.expired` |
| `UNDERPAID` | Partial payment received | `payment.underpaid` |
| `OVERPAID` | Excess payment received | `payment.overpaid` |

## Event Publishing (RabbitMQ)

All status changes automatically publish events to RabbitMQ with the following structure:

```json
{
  "id": "payment-uuid",
  "reservationId": "RES-123",
  "amount": 20000,
  "currency": "ARS",
  "status": "SUCCESS",
  "userId": "user-uuid",
  "meta": { "additional": "data" },
  "timestamp": "2025-09-14T10:30:00Z"
}
```

**Routing Keys:**
- `payment.completed` - For successful payments
- `payment.failed` - For failed/cancelled payments
- `payment.refunded` - For refunded payments
- `payment.expired` - For expired payments
- `payment.underpaid` - For partial payments
- `payment.overpaid` - For overpayments

## Frontend Integration

The frontend correctly handles different payment statuses:

| Backend Status | Frontend Display | Payment Button Shown |
|---------------|------------------|---------------------|
| `PENDING` | Pendiente (Orange) | ✅ Yes |
| `UNDERPAID` | Pago Parcial (Blue) | ❌ No |
| `SUCCESS` | Confirmado (Green) | ❌ No |
| `FAILURE` | Cancelado (Red) | ❌ No |
| `REFUND` | Cancelado (Red) | ❌ No |

## API Examples

### Create Payment
```bash
curl -X POST http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 20000,
    "res_id": "RES-123",
    "user_id": "user-456",
    "currency": "ARS"
  }'
```

### Update Payment Status
```bash
curl -X PUT http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "payment-uuid",
    "status": "SUCCESS"
  }'
```

### Cancel Payment
```bash
curl -X PATCH http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "payment-uuid",
    "action": "cancel",
    "reason": "Reservation cancelled"
  }'
```

### Refund Payment
```bash
curl -X PATCH http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "payment-uuid",
    "action": "refund",
    "amount": 100.00,
    "reason": "Service not provided"
  }'
```

## Testing

Run the integration test:
```bash
node test-reservas-integration.js
```

This will test all scenarios expected by the Reservas module and verify that events are properly published.

## Compliance Checklist

✅ **Payment Creation** - Creates payments in PENDING status  
✅ **Payment Confirmation** - Updates to SUCCESS and publishes events  
✅ **Payment Cancellation** - Updates to FAILURE and publishes events  
✅ **Payment Refund** - Updates to REFUND and publishes events  
✅ **Event Publishing** - All status changes publish to RabbitMQ  
✅ **Status Mapping** - Frontend correctly displays all status types  
✅ **Partial Payments** - UNDERPAID status handled without payment buttons  
✅ **API Compatibility** - Endpoints match expected integration format  

## Next Steps

The Payment Module is now fully compliant with the Reservas module integration requirements. The Reservas module can:

1. Create payments via POST requests
2. Update payment statuses via PUT requests  
3. Cancel payments via PATCH requests with cancel action
4. Refund payments via PATCH requests with refund action
5. Receive event notifications via RabbitMQ for all status changes

All scenarios described in the Reservas module documentation are now supported and tested.