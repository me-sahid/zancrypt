# Installation

This guide will walk you through setting up Zancrypt (YuuVault) for local development and testing.

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- Python (3.12 or higher)
- Docker & Docker Compose
- Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/me-sahid/zancrypt.git
cd zancrypt
```

## Step 2: Environment Configuration

You will need to configure environment variables. Copy the `.env.example` file in the root and place the appropriate environment variable configurations in the respective frontend and backend folders.

```bash
cp .env.example backend/.env
cp .env.example frontend/.env
```

*Note: Update the backend `.env` file with your Postgres and Redis connection URIs, and any third-party cloud storage credentials (like B2 or AWS).*

## Step 3: Infrastructure Setup

Zancrypt relies on Postgres and Redis. You can start these services using Docker Compose:

```bash
docker-compose up -d db redis
```

## Step 4: Backend Setup

Navigate to the backend directory, install the Python dependencies, and run database migrations.

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
```

Run the backend server using Uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

*For background processing, you will also need to start the Celery worker:*
```bash
celery -A app.core.celery_app worker --loglevel=info
```

## Step 5: Frontend Setup

Navigate to the frontend directory, install dependencies, and start the development server.

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`.
