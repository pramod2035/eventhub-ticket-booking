# EventHub: Full-Stack Ticket Booking & Wallet System

A complete MERN stack application built to handle high-concurrency event ticket booking. It features real-time seat locking, a digital wallet system, and atomic database transactions to guarantee data integrity.

## 📋 Core Modules Implemented

1. **Authentication:** JWT-based signup/login with distinct `USER` and `ADMIN` role access.
2. **Wallet System:** Users can add funds, and the system maintains a strict transaction ledger. A database-level constraint ensures a strictly **no negative balance** environment.
3. **Event & Seat Booking:** Users can view seat matrices, reserve seats (locked for 5 minutes), and finalize bookings using wallet deductions.
4. **History:** Dashboards for both Wallet Transactions and Event Bookings.
5. **Admin Dashboard:** Full CRUD for events, bulk seat generation (S1-S60), global transaction/booking monitoring, and one-click atomic refund/cancellation processing.

## 🛡️ Critical Requirements & Edge Case Handling

This system was architected specifically to handle the required concurrency and edge-case scenarios:

* **Parallel Booking Requests:** Handled via MongoDB document-level state checks. A seat transitions from `AVAILABLE` to `RESERVED` with a `lockedBy` user ID.
* **Wallet Race Conditions:** Handled using atomic `$inc` operators within a MongoDB transaction.
* **Expired Reservations During Payment:** The checkout controller strictly validates the `lockedUntil` timestamp against `Date.now()`. If a user attempts to pay after 5 minutes, the transaction is rejected and rolled back.
* **Duplicate API Calls:** Handled via a custom Idempotency Middleware. The `/api/bookings/confirm` route requires an `Idempotency-Key` header to prevent double-charging a user who clicks "Pay" twice.
* **Atomicity & Partial Failures:** Booking confirmation and wallet deduction are wrapped in a MongoDB Session (`session.startTransaction()`). They succeed or fail together.

## 🛠️ Tech Stack & Design Decisions
* **Frontend:** React.js, Vite, Tailwind CSS, React Router
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose)
* **Currency Handling:** To prevent JavaScript floating-point arithmetic errors, all financial data is stored in integer format (paise) in the database and converted to rupees strictly for UI rendering.

## 🌐 API Endpoints

**Auth Endpoints**
* `POST /api/auth/register` - Register a new user
* `POST /api/auth/login` - Authenticate and receive JWT

**Wallet Endpoints** (Requires Token)
* `POST /api/wallet/topup` - Add funds to wallet
* `GET /api/wallet/balance` - Retrieve current wallet balance

**Booking Endpoints** (Requires Token)
* `GET /api/bookings/events` - Fetch all events and their details
* `POST /api/bookings/reserve` - Lock a seat for 5 minutes
* `POST /api/bookings/confirm` - Atomic checkout (Requires `Idempotency-Key` header)

**Admin Endpoints** (Requires Admin Token)
* `POST /api/admin/events` - Create event and generate seat matrix
* `POST /api/admin/refund/:bookingId` - Cancel booking, free seat, and refund wallet

## ⚙️ Local Setup Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster URI (Must support replica sets for Transactions)

### 1. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
\`\`\`
Start the server:
\`\`\`bash
npm run dev
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
\`\`\`

## 📌 Assumptions
* **Admin Provisioning:** Admin accounts are seeded directly into the database or updated manually by a DBA. The public registration flow defaults to the `USER` role.
* **Seat Generation:** Events default to a standard 60-seat grid, generated sequentially upon Event Creation via the Admin panel.