
          PESAPAL API + DASHBOARD


1. API DEVELOPMENT

- Purpose:
  Building an API that integrates with Pesapal’s payment APIs.
  The API does the following:
    * Handle Pesapal authentication securely.
    * Generate the payment iframe URL.
    * Expose endpoints for handling:
        - Payment initiation
        - Callback URL
        - IPN (Instant Payment Notification)

- Authentication:
  * Use Pesapal’s OAuth2 token.
  * Cache and refresh token when expired.

- Endpoints:
  * POST /payments/initiate
    -> Creates an order, returns iframe URL.
  * GET /payments/callback
    -> Pesapal redirects here after payment.
  * POST /payments/ipn
    -> Pesapal sends transaction status updates here.


2. DASHBOARD DEVELOPMENT

- Purpose:
  Provide a web-based interface to track all payments.

- Features:
  * Show list of all payments with:
    - Transaction ID
    - User details
    - Amount
    - Status (Pending, Completed, Failed)
    - Timestamp
  * Search + Filter options.
  * Auto-refresh or manual refresh to get latest statuses.

- Frontend:
  * React + TailwindCSS
  * Pesapal brand colors (Blue + Red)


3. DATABASE (SQLite)

- Database File: payments.db

- Tables:

  TABLE: payments
 
  id               INTEGER (Primary Key, Auto Increment)
  transaction_id   TEXT (Unique)
  user_name        TEXT
  user_email       TEXT
  amount           REAL
  currency         TEXT
  status           TEXT (pending / completed / failed)
  created_at       TIMESTAMP (Default: current time)

  


4. FLOW

- User initiates payment → API creates payment record → 
  Pesapal returns iframe URL → API responds with iframe URL.

- Pesapal calls CALLBACK URL after payment → Status is updated.

- Pesapal sends IPN notifications → Status updated in payments table.

- Dashboard fetches data from API and displays all transactions.


5. Tech Stack

- Backend: FastAPI (Python), SQLite (Database)
- Frontend: React (Vite), Tailwind CSS
- Containerization: Docker + Docker Compose
- Payment Gateway: Pesapal API


6. Setup Instructions

        Backend Setup
    1. Navigate to the `backend/` folder.
    2. Copy `.env.example` to `.env` and add your Pesapal credentials.
            PESAPAL_CONSUMER_KEY=your_key
            PESAPAL_CONSUMER_SECRET=your_secret
            BASE_URL=https://cybqa.pesapal.com/pesapalv3
    3. Build and Run using docker(docker-compose-up--build)
    4 . Backend should be running at :  http://localhost:8000

        Frontend Setup
    1. Navigate to the frontend folder
    2. Install dependencies(npm install)
    3. Frontend should be running at : http://localhost:5173

