# EventHub - Ticket Booking Platform

A full-stack ticket booking platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It features role-based access control, dynamic seat generation, and a complete admin dashboard for event and refund management.

## 🔗 Live Links
- **Frontend (Deployed on Vercel):** https://eventhub-ticket-booking-git-main-pramodnbhat2035-9891s-projects.vercel.app/
- **Backend (Deployed on Render):** https://eventhub-ticket-booking.onrender.com

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed locally or a MongoDB Atlas URI

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/pramod2035/eventhub-ticket-booking.git
cd eventhub-ticket-booking
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` directory with the following variables:
\`\`\`env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
\`\`\`

**Seed the Database (Creates default Admin & User accounts for testing):**
\`\`\`bash
node src/seed.js
\`\`\`
*(Note: If your seed file is in the root of the backend folder, just run `node seed.js`)*

Start the backend server:
\`\`\`bash
npm start
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
Create a `.env` file in the `frontend` directory:
\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`
Start the frontend application:
\`\`\`bash
npm run dev
\`\`\`

---

## 🏗️ Design Decisions

1. **Pre-Generated Seat Documents:** Instead of just keeping a tally of "available seats", the backend dynamically generates individual seat documents in the database when an admin creates or updates an event. This prevents race conditions (double-booking) and allows exact seat tracking.
2. **Role-Based Authentication (JWT):** Implemented distinct `ADMIN` and `USER` roles. Middleware protects admin-specific routes (like creating events and processing refunds) from unauthorized access.
3. **Tailwind CSS for UI:** Chose Tailwind for the frontend to maintain a clean, responsive, and modern design architecture without the overhead of heavy component libraries.
4. **Simulated Wallet System:** To keep the focus on core logic rather than third-party payment gateway integration, refunds dynamically increment a user's simulated wallet balance.

---

## 🤔 Assumptions Made

1. **Admin Creation:** It is assumed that Admin users are either seeded directly into the database (using the provided `seed.js` script) or upgraded manually by a super-admin. Standard registration defaults to the `USER` role.
2. **Seat Layout:** It is assumed that the event space is a general layout. Seats are generated sequentially (e.g., S1, S2, S3) rather than grouped by specific rows or VIP tiers.
3. **Refund Policy:** It is assumed that admins have the ultimate authority to process refunds, and that cancelled tickets immediately free up the associated seat for another user to book.

---

## 📬 API Documentation
A complete Postman Collection is included in the root directory (`EventHub_Postman_Collection.json`). You can import this directly into Postman to test all Admin, Auth, and Booking routes locally or against the live deployment.