# Seva Setu Platform

Seva Setu is a comprehensive platform consisting of a Next.js frontend and a NestJS backend with a PostgreSQL database.

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js** (v18.x or newer)
- **npm** (or yarn/pnpm)
- **PostgreSQL** (Running locally on default port `5432` or an external database url)

## Environment Variables

### Backend Environment Variables (`backend/.env`)

Navigate to the `backend` directory and ensure the `.env` file exists with the following values:

```env
# Database Connection String for Prisma
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/seva_setu_db?schema=public"

# Application Settings
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET="super-secret-key-for-seva-setu"
```

### Frontend Environment Variables (`frontend/.env.local`)

*(Optional)* If you need to specify the backend GraphQL URL for the Apollo Client in the frontend, you can create a `.env.local` inside the `frontend` directory:

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT="http://localhost:3000/graphql"
```

## Setup and Installation

Follow these steps to initialize both projects before running them:

1. **Install Backend Dependencies & Setup DB:**
   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:push
   cd ..
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Start Commands (Run Concurrently)

To run both the NestJS backend and Next.js frontend concurrently, make sure you are in the root directory (`seva_setu_platform/`). You can use `npx concurrently` to start them at the same time in a single terminal.

Since the backend is configured to run on port `3000`, we'll instruct the Next.js frontend to run on port `3001` to avoid port conflicts.

Run the following command from the root directory:

```bash
npx concurrently "cd backend && npm run start:dev" "cd frontend && npm run dev -- -p 3001"
```

### Running in Separate Terminals (Alternative)

If you prefer to run them in separate terminals instead of concurrently:

**Terminal 1 (Backend):**
```bash
cd backend
npm run start:dev
# Starts on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev -- -p 3001
# Starts on http://localhost:3001
```

## Useful URLs
- **Frontend App:** `http://localhost:3001`
- **Backend GraphQL API/Playground:** `http://localhost:3000/graphql`
