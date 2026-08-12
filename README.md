# Expense Tracker

A full-stack expense tracker built with the MERN stack (MongoDB, Express, React, Node.js). Track daily spending, monitor income, and view your finances through an analytics dashboard.

## Features

- **Expense tracking** — log and categorize daily expenses
- **Income tracking** — record income alongside expenses for a complete picture of cash flow
- **Analytics dashboard** — visual breakdown of spending and income trends
- **Recurring expenses** — automatic recurring-expense handling via scheduled cron jobs
- **Dark mode** — theme toggle across the UI, including notification components

## Tech Stack

**Frontend:** React
**Backend:** Node.js, Express
**Database:** MongoDB

## Project Structure

```
Expense-Tracker/
├── backend/     # Express server, API routes, MongoDB models, cron jobs
├── frontend/    # React application
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/rajaryan26940-del/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables

   Create a `.env` file inside `backend/` with your configuration, for example:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

5. Run the backend server
   ```bash
   cd backend
   npm start
   ```

6. Run the frontend app
   ```bash
   cd frontend
   npm start
   ```

The app should now be running locally, with the frontend served on its default port and the backend API available on the port set in `.env`.

## Screenshots

*Add a screenshot or two of the dashboard here — this is one of the first things a visitor looks for.*

## License

This project is open source and available for personal and educational use.
