# NotesApp

A full-stack MERN notes application built as a Cohort 9 assignment. Users can register, log in, and manage their own notes with full CRUD operations, search, category filtering, and toast notifications.

## Live / Local URLs

| Purpose | URL |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/health |

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Node.js, Express 5, MongoDB, Mongoose
- **Authentication**: JWT-based with logout token revocation via a `tokenVersion` field
- **Testing**: Mocha + Chai (backend)
- **Infrastructure**: Docker Compose (mongo-db, backend, frontend)

## Features

- User registration and login with JWT authentication
- Logout with token revocation via `tokenVersion`
- Full notes CRUD (create, read, update, delete)
- Ownership enforcement — users can only access their own notes
- Search and category filtering on notes
- Toast notifications for user feedback
- Rate limiting on the login endpoint
- Health check endpoint on the backend

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)

## Getting Started (Docker-based)

1. Clone the repository.
2. Ensure Docker and Docker Compose are running.
3. Copy the environment template and fill in the required values:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Start the stack:
   ```bash
   docker-compose up --build
   ```
5. Access the frontend at http://localhost:5173 and the backend API at http://localhost:5000/api.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the backend server listens on | `5000` |
| `NODE_ENV` | Node environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo-db:27017/notes_app` |
| `JWT_SECRET` | Secret key for signing JWTs (must be strong and unique) | — |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_HMAC_KEY` | Key used to hash emails in failed-login logs (must be strong and unique) | — |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for the backend API | — |

## API Endpoint Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/signup` | Register a new user | No |
| POST | `/auth/login` | Log in and receive a JWT | No |
| POST | `/auth/logout` | Invalidate the current JWT | Yes (Bearer) |

### Notes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/notes` | List all notes for the authenticated user | Yes (Bearer) |
| GET | `/notes/:id` | Get a single note by ID | Yes (Bearer) |
| POST | `/notes` | Create a new note | Yes (Bearer) |
| PUT | `/notes/:id` | Update an existing note | Yes (Bearer) |
| DELETE | `/notes/:id` | Delete a note | Yes (Bearer) |

## Running Tests

Backend tests use Mocha and Chai. Run them from the `backend/` directory:

```bash
cd backend
npm test
```

## Project Structure

```text
cohort-9-mern-12902-khushi/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, logging, rate limiting
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   ├── validators/    # Request validation schemas
│   │   └── utils/         # Shared utilities
│   ├── server.js          # Entry point
│   ├── package.json
│   ├── Dockerfile
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── api/           # API client and endpoint functions
│   │   └── pages/         # Page-level components
│   ├── public/            # Static public files
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── package.json
│   ├── Dockerfile
│   ├── vite.config.js
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Known Limitations

- No TypeScript — the project uses plain JavaScript throughout.
- No frontend test suite yet.
- Local development only — no deployment configuration is in place.
- The Docker setup is intended for local development and has not been tested for production use.

## Author

Khushi Kandhani — Cohort 9, MERN assignment.