# Social Feed API

Production-ready REST API for a social feed application built with Express.js, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime:** Node.js 22+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT (bcrypt + jsonwebtoken)
- **Validation:** Zod
- **Logging:** Pino
- **File Upload:** Multer
- **Testing:** Jest + Supertest
- **Containerization:** Docker & Docker Compose

## Architecture

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Entry point
├── config/                   # App configuration
├── middleware/                # Auth, validation, upload, error handling
├── shared/                   # Prisma client, errors, response helpers, validation
├── types/                    # TypeScript type definitions
├── modules/
│   ├── auth/                 # Register, login, current user
│   ├── users/                # User profile
│   ├── posts/                # Post CRUD, feed with cursor pagination
│   ├── comments/             # Comment CRUD
│   ├── replies/              # Reply CRUD
│   └── likes/                # Polymorphic likes (posts, comments, replies)
```

Each module follows a consistent layered pattern:

```
module/
├── controller.ts   # Request handlers
├── service.ts      # Business logic
├── repository.ts   # Database queries
├── routes.ts       # Route definitions
├── validation.ts   # Zod schemas
├── types.ts        # Input/output interfaces
└── dto.ts          # Data transfer objects
```

## Features

- **Authentication** — Register, login, current user (JWT-based)
- **Feed** — Cursor-based pagination, newest first, public + own private posts
- **Posts** — Create, read, update, delete with optional image upload
- **Comments** — Create, edit, delete comments on posts
- **Replies** — Create, edit, delete replies on comments
- **Likes** — Polymorphic like/unlike for posts, comments, and replies

## API Endpoints

### Authentication

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login               |
| GET    | `/api/auth/me`       | Get current user    |

### Posts

| Method | Path             | Description                       |
| ------ | ---------------- | --------------------------------- |
| GET    | `/api/posts`     | Feed (cursor pagination)          |
| POST   | `/api/posts`     | Create post (multipart for image) |
| GET    | `/api/posts/:id` | Get post                          |
| PATCH  | `/api/posts/:id` | Update post                       |
| DELETE | `/api/posts/:id` | Delete post                       |

### Post Likes

| Method | Path                   | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/api/posts/:id/like`  | Like a post          |
| DELETE | `/api/posts/:id/like`  | Unlike a post        |
| GET    | `/api/posts/:id/likes` | List users who liked |

### Comments

| Method | Path                      | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/posts/:id/comments` | Get comments for a post |
| POST   | `/api/posts/:id/comments` | Create comment          |
| PATCH  | `/api/comments/:id`       | Update comment          |
| DELETE | `/api/comments/:id`       | Delete comment          |

### Comment Likes

| Method | Path                      | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/api/comments/:id/like`  | Like a comment       |
| DELETE | `/api/comments/:id/like`  | Unlike a comment     |
| GET    | `/api/comments/:id/likes` | List users who liked |

### Replies

| Method | Path                        | Description  |
| ------ | --------------------------- | ------------ |
| POST   | `/api/comments/:id/replies` | Create reply |
| PATCH  | `/api/replies/:id`          | Update reply |
| DELETE | `/api/replies/:id`          | Delete reply |

### Reply Likes

| Method | Path                     | Description          |
| ------ | ------------------------ | -------------------- |
| POST   | `/api/replies/:id/like`  | Like a reply         |
| DELETE | `/api/replies/:id/like`  | Unlike a reply       |
| GET    | `/api/replies/:id/likes` | List users who liked |

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/social_feed?schema=public
JWT_SECRET=your-secure-secret-here
JWT_EXPIRES_IN=7d
UPLOAD_PATH=uploads
CORS_ORIGIN=http://localhost:3000
```

### Local Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Docker Setup

```bash
# Build and start all services
docker compose up -d

# Run migrations (first time)
docker compose exec app npx prisma migrate deploy

# Seed database
docker compose exec app npm run db:seed
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## API Response Format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

## Performance & Scalability

The system is designed to scale horizontally by running multiple Express instances behind a load balancer with PostgreSQL indexing and optional Redis caching.

Key design decisions:

- **Cursor pagination** for feed queries (avoids offset performance issues)
- **Database indexes** on frequently queried columns (created_at, user_id, visibility, foreign keys)
- **Unique constraint** on likes to prevent duplicates at the database level
- **Stateless API** design enables horizontal scaling
- **Prisma** provides SQL injection protection and efficient query generation
