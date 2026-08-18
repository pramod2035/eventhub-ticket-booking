# EventHub: Full-Stack Ticket Booking & Wallet System

A complete MERN stack application built to handle high-concurrency event ticket booking. It features real-time seat locking, a digital wallet system, and atomic database transactions to guarantee data integrity.

## 🚀 Live Links
* **Frontend (Vercel):** `[Link to be added after deployment]`
* **Backend (Render):** `[Link to be added after deployment]`
* **API Documentation:** `[Link to Postman Collection]`

## 📋 Core Features Implemented

**User Module:**
* JWT-based Registration & Authentication.
* Wallet System (Add funds, view balance, transaction history).
* Real-time seat matrix visualization.
* 5-minute temporary seat reservation lock.
* Ticket booking via wallet deduction.
* Booking history dashboard.

**Admin Module:**
* Secure Admin-only dashboard.
* Event creation and bulk seat generation (S1-S60).
* Global monitoring of all bookings and user transactions.
* Atomic refund and cancellation processing.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Axios
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose)

## 🏗️ Design Decisions & Architecture

To address the critical requirements and edge cases of the assessment, the following architectural decisions were implemented:

1. **Atomic Transactions (No Double Booking / Spending):** The core booking and refund logic utilizes MongoDB Sessions (`session.startTransaction()`). Deducting wallet funds, changing seat status, and generating booking/transaction logs happen as a single atomic unit. If any step fails (e.g., partial failure or network drop), the entire operation rolls back safely.

2. **Strict Wallet Constraints & Ledger:** To prevent catastrophic JavaScript floating-point errors, all financial data is stored in integer format (paise) and only converted to standard rupees on the frontend. The backend strictly enforces a "No negative balance" rule at the database schema level and logs every credit/debit into an immutable `Transaction` ledger.

3. **Concurrency & Seat Expiry:**
   When a user selects a seat, it transitions to a `RESERVED` state and locks for exactly 5 minutes using a timestamp (`lockedUntil`). The backend validates this timestamp at checkout. Expired seats are automatically treated as `AVAILABLE` by the query engine, requiring no external cron jobs or race conditions.

4. **Idempotency (Retry-Safe APIs):**
   A custom Idempotency Middleware was built for the checkout route. It utilizes an `Idempotency-Key` header and an expiring TTL index in MongoDB to ensure that if a user double-clicks the "Pay" button or experiences a laggy connection, they are never charged twice for the same transaction.

## ⚙️ Local Setup Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster URI

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
* **Admin Provisioning:** It is assumed that Admin users are either seeded directly into the database or promoted manually by a DBA. The standard registration flow creates standard `USER` roles.
* **Seat Matrix:** Events default to a standard 60-seat grid, generated sequentially (S1-S60) upon Event Creation via the Admin panel.