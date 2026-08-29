# NotesApp

A full-stack notes application built for a Cohort 9 assignment. Users can sign up, log in, and manage their own notes — with rich text editing, categories, real-time sync across tabs and devices, and a full backend/frontend test suite.

## Live / Local URLs

| Purpose | URL |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/health |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Tiptap (rich text editor)
- **Backend**: Node.js, Express 5, TypeScript, MongoDB, Mongoose, Socket.IO
- **Authentication**: JWT-based, with real logout token revocation via a `tokenVersion` field — a stolen or reused token is invalidated the moment a user logs out, not just when it naturally expires
- **Real-time**: Socket.IO — notes stay in sync live across every tab or device a user has open
- **Testing**: Mocha + Chai + Supertest (backend), Jest + React Testing Library (frontend)
- **Code Quality**: SonarQube (Community Edition, self-hosted via Docker) with coverage reporting
- **Infrastructure**: Docker Compose (MongoDB, backend, frontend)

## Features

- User registration, login, and logout with JWT authentication
- Logout immediately revokes the token server-side, and force-disconnects any live socket connections tied to that session
- Full notes CRUD (create, read, update, delete) with rich text editing (bold, italic, bullet/numbered lists)
- Notes support categories, with filtering by category on the dashboard
- Ownership enforcement — users can only ever access their own notes, enforced at the database query level, not just hidden in the UI
- Search across title, content, and category
- Real-time sync — create, edit, or delete a note in one tab or device, and it updates instantly everywhere else you're logged in
- Export notes to a JSON file, and import them back in — with validation so a malformed file can't break the import
- User profile page showing account details
- Toast notifications for user feedback throughout
- Rate limiting on login and signup to prevent brute-force / spam attempts
- Startup validation that refuses to boot if required secrets are missing or left as placeholder values
- Health check endpoint on the backend

## Prerequisites

- Docker and Docker Compose installed
- Node.js ^20.19.0 || >=22.12.0 (for local development without Docker)

## Getting Started (Docker-based)

1. Clone the repository.
2. Ensure Docker and Docker Compose are running.
3. Copy the environment templates and fill in the required values:
```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
```
   Generate real values for `JWT_SECRET` and `LOG_HMAC_KEY` rather than leaving the placeholders — the backend will refuse to start otherwise:
```bash
   openssl rand -hex 32
```
   The frontend `VITE_API_URL` (used by `frontend/src/api/axiosClient.ts`) defaults to `http://localhost:5000/api` — update it if your backend runs on a different host or port.
4. Start the stack:
```bash
   docker compose up -d --build
```
5. Open the frontend at http://localhost:5173.

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
| `FRONTEND_URL` | Frontend origin, used for Socket.IO CORS | `http://localhost:5173` |

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
| POST | `/auth/logout` | Invalidate the current JWT and disconnect live sockets | Yes (Bearer) |

### Notes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/notes` | List all notes for the authenticated user | Yes (Bearer) |
| GET | `/notes/:id` | Get a single note by ID | Yes (Bearer) |
| POST | `/notes` | Create a new note | Yes (Bearer) |
| PUT | `/notes/:id` | Update an existing note | Yes (Bearer) |
| DELETE | `/notes/:id` | Delete a note | Yes (Bearer) |

## Real-time Updates

The backend runs a Socket.IO server alongside the REST API. When a client connects, it authenticates using the same JWT as the REST API and joins a private room scoped to that user — so live updates only ever reach that user's own sessions, never anyone else's.

Whenever a note is created, updated, or deleted through the REST API, the backend also emits an event to that room, and every connected tab/device updates its notes list immediately — no manual refresh needed.

## Running Tests

**Backend** — Mocha, Chai, and Supertest, running against an in-memory MongoDB instance so nothing touches the real database:
```bash
cd backend
npm test
```

**Backend with coverage** (used for the SonarQube scan):
```bash
cd backend
npm run test:coverage
```

**Frontend** — Jest and React Testing Library:
```bash
cd frontend
npm test
```

## Code Quality (SonarQube)

This project has been scanned with SonarQube Community Edition (self-hosted via Docker). Scan screenshots are available in [`SonarCubeReport/`](./SonarCubeReport).

To run a scan yourself:
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:community
```
Then generate a token from the SonarQube UI at `http://localhost:9000` and run:
```bash
sonar-scanner -Dsonar.login=<your-token>
```

## Project Structure

```text
cohort-9-mern-12902-khushi/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection, environment validation
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, logging, rate limiting, error handling
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers
│   │   ├── validators/    # Request validation schemas
│   │   ├── utils/         # Shared utilities
│   │   ├── app.ts         # Express app configuration
│   │   └── socket.ts      # Socket.IO setup and auth
│   ├── test/               # Mocha/Chai/Supertest test suite
│   ├── server.ts           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── api/           # API client and endpoint functions
│   │   ├── pages/         # Route-level page components
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── socket.ts       # Socket.IO client connection
│   │   └── index.css
│   ├── public/             # Static public files
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── .env.example
├── SonarCubeReport/         # SonarQube scan screenshots
├── docker-compose.yml
├── sonar-project.properties
├── .gitignore
└── README.md
```

## Known Limitations

- No production deployment configuration — the Docker Compose setup here is intended for local development only.
- JWT is stored in `localStorage` on the frontend rather than an httpOnly cookie; understood as a tradeoff, not an oversight.

## Author

Khushi Kandhani — Cohort 9, MERN assignment.
