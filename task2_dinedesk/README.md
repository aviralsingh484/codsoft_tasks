# DineDesk - Restaurant Ordering Platform

Task 2 of the CODSOFT Full Stack Web Development internship.

DineDesk is a restaurant ordering and table management system. Customers can browse the menu, order food (dine-in or takeaway), pay, track the order and book a table. The kitchen has its own dashboard to manage incoming orders, and an admin can manage the menu and reservations.

## Features

**Customers**
- Digital menu with categories, search and a vegetarian filter
- Cart with quantity controls (saved in the browser)
- Checkout with dine-in / takeaway, table number, order notes
- Payment by card (demo only, nothing is charged) or cash at the counter
- Live order tracking (placed, preparing, ready, completed)
- Table reservations with a live check of free tables, plus cancel option
- Sign up / log in

**Kitchen staff**
- Dashboard with new, preparing and ready orders
- Moves orders forward with one click, refreshes automatically
- Shows customer notes and payment status

**Admin**
- Daily numbers: orders, revenue, active orders, bookings
- Best selling dishes and recent orders
- Add, edit, delete dishes and mark them sold out
- View and manage all reservations

## Tech stack

- Frontend: Next.js (pages router), React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT with bcrypt password hashing

## Running it locally

You need Node.js 18+ and PostgreSQL installed.

### 1. Database

Create an empty database:

```
psql -U postgres -c "CREATE DATABASE dinedesk;"
```

### 2. Backend

```
cd server
npm install
cp .env.example .env
```

Open `.env` and put your own PostgreSQL password in `DATABASE_URL`. Then create the tables and sample data and start the server:

```
npm run db:setup
npm run dev
```

The API runs on http://localhost:5000.

### 3. Frontend

In a second terminal:

```
cd client
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000.

## Demo accounts

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Customer | customer@dinedesk.com  | customer123 |
| Kitchen  | kitchen@dinedesk.com   | kitchen123  |
| Admin    | admin@dinedesk.com     | admin123    |

New sign ups are always created as customers.

## Project structure

```
server/
  sql/schema.sql        table definitions
  scripts/setupDb.js    creates tables + sample data
  src/routes/           auth, menu, orders, reservations, admin
  src/middleware/       JWT auth and role checks
client/
  pages/                every screen of the app
  components/           navbar, menu rows, order tracker, etc.
  context/              login state and cart state
  lib/                  API helper and formatting helpers
```

## Notes

- Prices are always read from the database when an order is placed, so they cannot be changed from the browser.
- A table counts as taken if another confirmed booking is within 2 hours of the requested time.
- Card payment is a simulation. A real gateway (like Razorpay or Stripe test mode) can be plugged into the order route later.
