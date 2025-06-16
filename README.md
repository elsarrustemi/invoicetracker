# Invoice Tracker

A full-stack invoice tracking application built with modern technologies.

## Tech Stack

### Backend
- NestJS
- Apollo GraphQL
- Prisma ORM
- PostgreSQL

### Frontend
- React
- Apollo Client
- TypeScript

## Project Structure
```
invoicetracker/
├── backend/           # NestJS backend
├── frontend/         # React frontend
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your PostgreSQL database
4. Configure your environment variables in `.env`
5. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Features
- Client Management
- Service Management
- Invoice Generation and Tracking