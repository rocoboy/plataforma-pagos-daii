# Payment Platform Backend - Context Documentation

This document provides comprehensive context about the backend architecture and API structure for AI agents and developers working on this payment platform project.

## 🏗️ Project Structure

```
plataforma-pagos-daii/
├── apps/
│   ├── api/                    # Next.js API Backend
│   ├── bridge/                 # Message Bridge Service
│   ├── types/                  # Shared TypeScript Types
│   └── web/                    # React Frontend
```

## 🎯 Backend Overview

The backend is built using **Next.js 15** with **App Router** and integrates with **Supabase** for database operations. It follows a clean architecture with type-safe API endpoints.

### Tech Stack
- **Framework**: Next.js 15.5.2 with App Router
- **Database**: Supabase (PostgreSQL)
- **Runtime**: Node.js/Bun
- **Validation**: Zod schemas
- **TypeScript**: Full type safety with generated Supabase types

## 📊 Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  res_id TEXT UNIQUE NOT NULL,           -- External reference ID
  created_at TIMESTAMPTZ DEFAULT now(),
  modified_at TIMESTAMPTZ,
  meta JSONB,                            -- Flexible metadata storage
  user_id TEXT,                          -- Optional user association
  status TEXT,                           -- Payment status
  amount DOUBLE PRECISION NOT NULL,      -- Payment amount
  currency currency DEFAULT 'ARS'       -- Currency enum
);
```

### Enums
```sql
-- Currency types
CREATE TYPE currency AS ENUM ('ARS', 'USD', 'EUR');

-- Payment status types  
CREATE TYPE payment_status AS ENUM (
  'PENDING',
  'SUCCESS', 
  'FAILURE',
  'UNDERPAID',
  'OVERPAID',
  'EXPIRED',
  'REFUND'
);
```

## 🔌 API Endpoints

### Base URL Structure
```
/api/
├── payments/              # Payment queries (GET operations)
├── users/                 # User management
└── webhooks/              # Payment operations (POST/PATCH)
    └── payments/
```

### Payment Operations

#### 1. Get All Payments
```http
GET /api/payments
```
**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "uuid",
      "res_id": "string",
      "amount": 100.50,
      "currency": "ARS",
      "status": "PENDING",
      "user_id": "string",
      "meta": {},
      "created_at": "2025-01-01T00:00:00Z",
      "modified_at": null
    }
  ]
}
```

#### 2. Get Payment by ID
```http
GET /api/payments/[id]
```

#### 3. Create Payment
```http
POST /api/webhooks/payments
```
**Request Body:**
```json
{
  "res_id": "string",           // Required: External reference
  "amount": 100.50,             // Required: Payment amount
  "currency": "ARS",            // Optional: defaults to ARS
  "user_id": "string",          // Optional: User identifier
  "meta": {                     // Optional: Additional data
    "description": "Payment description",
    "order_id": "12345"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "generated-uuid",
    "res_id": "string",
    "amount": 100.50,
    "currency": "ARS",
    "status": "PENDING",
    "user_id": "string",
    "meta": {},
    "created_at": "2025-01-01T00:00:00Z",
    "modified_at": null
  }
}
```

#### 4. Update Payment Status
```http
PATCH /api/webhooks/payments
```
**Request Body:**
```json
{
  "id": "payment-uuid",
  "status": "SUCCESS"
}
```

## 🏗️ Code Architecture

### File Structure
```
apps/api/src/
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   ├── route.ts              # GET all payments
│   │   │   ├── get-all-payments.ts   # Query logic
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET specific payment
│   │   │       └── get-payment.ts    # Query logic
│   │   ├── users/                    # User endpoints
│   │   └── webhooks/
│   │       └── payments/
│   │           ├── route.ts          # POST/PATCH operations
│   │           ├── create-payment.ts # Creation logic
│   │           └── update-payment.ts # Update logic
│   ├── layout.tsx
│   └── page.tsx
└── lib/
    └── supabase/
        ├── client.ts                 # Client-side Supabase
        ├── server.ts                 # Server-side Supabase
        ├── middleware.ts             # Auth middleware
        └── schema.ts                 # Generated TypeScript types
```

### Key Implementation Details

#### Supabase Client Setup
```typescript
// Server-side client with request context
export function createClient(request: NextRequest) {
  // Implementation handles authentication and connection
}
```

#### Type Safety
```typescript
// Generated types from Supabase schema
export type Database = {
  public: {
    Tables: {
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      }
    }
    Enums: {
      currency: "ARS" | "USD" | "EUR";
      payment_status: "PENDING" | "SUCCESS" | "FAILURE" | ...;
    }
  }
}
```

#### Validation Schemas
```typescript
// Zod schemas for request validation
export const createPaymentBodySchema = z.object({
  res_id: z.string(),
  user_id: z.string().optional(),
  amount: z.number(),
  currency: z.enum(Constants.public.Enums.currency).optional(),
  meta: z.any().optional(),
});
```

## 🔐 Security & Validation

- **Zod validation** on all request bodies
- **TypeScript** ensures compile-time type safety
- **Supabase RLS** (Row Level Security) ready
- **Request context** passed to all database operations
- **Error handling** with proper HTTP status codes

## 🚀 Development Commands

```bash
# Start development server
cd apps/api
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📝 Usage Examples

### Creating a Payment
```bash
curl -X POST http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "res_id": "order-12345",
    "amount": 250.75,
    "currency": "ARS",
    "user_id": "user-abc123",
    "meta": {
      "description": "Product purchase",
      "order_id": "12345",
      "items": ["product-1", "product-2"]
    }
  }'
```

### Updating Payment Status
```bash
curl -X PATCH http://localhost:3000/api/webhooks/payments \
  -H "Content-Type: application/json" \
  -d '{
    "id": "payment-uuid-here",
    "status": "SUCCESS"
  }'
```

## 🔄 Payment Status Flow

```
PENDING → SUCCESS   (Payment completed successfully)
PENDING → FAILURE   (Payment failed)
PENDING → EXPIRED   (Payment timeout)
PENDING → UNDERPAID (Partial payment received)
PENDING → OVERPAID  (Excess payment received)
SUCCESS → REFUND    (Payment refunded)
```

## 🌐 Integration Points

- **Supabase Database**: Primary data storage
- **Bridge Service**: Message queue handling (`apps/bridge/`)
- **Frontend**: React app consuming APIs (`apps/web/`)
- **Shared Types**: Common TypeScript definitions (`apps/types/`)

## 📚 Additional Context

- **Project**: Payment platform for handling multi-currency transactions
- **Environment**: Development setup with local Supabase
- **Repository**: `plataforma-pagos-daii` owned by `rocoboy`
- **Branch**: Development work on `develop-harry`

---

*This context file should be attached to AI agents for understanding the backend architecture and API structure.*
