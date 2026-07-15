# Social Feed App — System Design

## What are we building?

A social feed app where people can sign up, make posts (text or images), comment, reply, like stuff, share posts, and bookmark them. Like a mini Twitter but simpler.

Frontend is Next.js with TypeScript. Backend is Express with TypeScript. Database is PostgreSQL. Images stored on floci (S3-compatible local storage at floci.io).

---

## Tech Choices

**Backend**

- Node.js + Express — well known, lots of libraries, easy to set up
- TypeScript — catches silly mistakes before they reach production
- PostgreSQL — handles relational data well, good indexing for feeds
- Prisma — write queries in TypeScript, get type safety for free. Migrations are easy
- JWT + bcrypt — stateless auth, no session management. Hash passwords properly
- Zod — validate incoming data. Same library works on frontend too
- Multer + floci — parse file uploads in memory, store images on floci (S3-compatible local storage at floci.io)

**Frontend**

- Next.js 16 — React framework, works well with Vercel
- Tailwind CSS — write styles fast without switching files
- React Query — fetches data, caches it, handles loading states
- Zustand — tiny state manager for auth stuff
- React Hook Form + Zod — forms with validation built in

---

## How it's organised

### Backend

```
src/
  server.ts            — starts the app
  app.ts               — wires up middleware and routes
  config/              — env config, logger
  middleware/          — auth, validation, error handler, file upload
  modules/
    auth/              — register, login, me
    users/             — profile stuff
    posts/             — create, edit, delete, feed
    comments/          — comments on posts
    replies/           — replies on comments
    likes/             — polymorphic likes for everything
    shares/            — share posts
    savedPosts/        — bookmark posts
  shared/              — prisma client, error classes, response helpers
  services/s3.ts       — upload/delete from S3
```

Each module has 7 files: routes, controller, service, repository, validation, types, dto. Keeps things separate — controllers don't touch the database, repositories don't format responses.

### Frontend

```
app/
  layout.tsx           — wraps everything in QueryProvider + AuthHydrate
  feed/page.tsx        — main feed (3 column layout)
  login/page.tsx       — login form
  register/page.tsx    — registration form
src/
  components/          — UI components (PostCard, CommentSection, etc.)
  hooks/               — React Query hooks (usePosts, useComments, useLikes)
  services/            — API calls (post.service.ts, auth.service.ts)
  stores/authStore.ts  — Zustand store for auth state
  lib/axios.ts         — axios instance with token interceptor
  types/index.ts       — TypeScript interfaces
```

---

## Database

7 tables. All foreign keys cascade on delete.

**users** — name, email (unique), hashed password, avatar

**posts** — user_id, content, image, visibility (public/private), shares_count. Indexed on created_at desc for feed sorting.

**comments** — post_id, user_id, content. Indexed on post_id.

**replies** — comment_id, user_id, content. Indexed on comment_id.

**likes** — this is the clever one. Uses target_type (POST/COMMENT/REPLY) plus target_id so one table handles likes for everything. Unique constraint on (user_id, target_type, target_id) so you can't double-like. Also has reaction_type for LIKE/LOVE/HAHA/WOW/SAD/ANGRY.

```
likes table
  id, user_id, target_type, target_id, reaction_type, created_at
  UNIQUE on (user_id, target_type, target_id)
```

Why one table instead of three? Less code duplication. One like service, one repository, one set of routes. Works the same for posts, comments, and replies.

**shares** — user_id, post_id. Unique on (user_id, post_id).
**saved_posts** — same pattern. Bookmarks.

---

## How auth works

1. User registers or logs in with email + password
2. Server hashes password with bcrypt (12 rounds), checks email is unique
3. Server gives back a JWT token (contains user id and email, expires in 7 days)
4. Frontend stores token in localStorage
5. Every API request sends token in Authorization header
6. Backend middleware verifies the token, looks up the user
7. If token is bad or expired, return 401. Frontend catches this and redirects to login

No refresh tokens. No logout endpoint. Simple and works.

---

## Feed and pagination

The feed shows all public posts plus your own private posts, newest first.

Uses cursor pagination — you pass the last post's ID as cursor, server returns the next batch. This stays fast even with millions of posts because it uses the index directly, no offset scanning.

```
GET /api/posts?cursor=abc-123&limit=20

Response:
{
  "data": [{ post1 }, { post2 }, ...],
  "pagination": {
    "cursor": "xyz-789",
    "hasMore": true
  }
}
```

Each post in the feed is enriched with:

- How many likes it got
- Top 5 reaction types
- Latest 3 comments (with replies)
- Whether the current user liked, shared, or saved it

All this enrichment happens in batch queries — one query for all likes, one for all comments, etc. Not one query per post.

---

## API endpoints

**Auth**

- POST /api/auth/register — create account
- POST /api/auth/login — sign in
- GET /api/auth/me — get your profile

**Posts**

- GET /api/posts — feed with pagination
- POST /api/posts — create post (supports image upload)
- GET /api/posts/:id — get one post
- PATCH /api/posts/:id — edit your post
- DELETE /api/posts/:id — delete your post

**Comments** — nested under posts

- GET /api/posts/:pid/comments
- POST /api/posts/:pid/comments
- PATCH /api/comments/:id
- DELETE /api/comments/:id

**Replies** — nested under comments, same CRUD pattern

**Likes** — works on posts, comments, and replies

- POST /:type/:id/toggle-like — like if not liked, unlike if liked
- GET /:type/:id/likes — who liked this

**Shares and SavedPosts** — similar toggle pattern

---

## Image upload flow

1. User picks an image on the frontend
2. Frontend builds FormData with text fields + the image file
3. Multer parses the multipart data, keeps file in memory
4. Validates file type (JPEG/PNG/GIF/WebP) and size (max 5MB)
5. Uploads to floci on port 4566 (drop-in S3 replacement via Docker)
6. Stores the key in the post record, returns the public URL

---

## Security stuff

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens verified on every protected route
- Rate limiting — 100 requests per 15 minutes per IP
- Helmet adds security headers
- CORS restricted to the frontend origin
- Zod validates all inputs before they hit the database
- Prisma parameterizes queries — no SQL injection
- Ownership checks — only the author can edit or delete their stuff
- File upload restricted to image types only

---

## Error handling

Custom error classes for different HTTP statuses:

- NotFoundError — 404
- UnauthorizedError — 401
- ForbiddenError — 403
- ValidationError — 400 (with field-level messages from Zod)
- ConflictError — 409

A global error handler catches everything and returns a consistent response shape: `{ success, message }`. Unknown errors get logged with the full stack trace but return a generic 500 to the client.

---

## Things that could be better

- **Token in localStorage** — vulnerable to XSS. HttpOnly cookies would be more secure but need CSRF handling
- **No real-time updates** — you have to refresh to see new posts. WebSockets would make it live
- **No image optimization** — images served as-is. Should resize and convert to WebP
- **No background jobs** — image processing, notifications, etc. Bull or RabbitMQ could help
- **No caching** — feed works fine now but Redis would help at scale
- **No server-side route protection on frontend** — current check is client-side only, so there's a brief flash before redirect

---

## How to run it

Backend:

```
docker compose up -d          # starts PostgreSQL + floci
npx prisma migrate deploy     # creates tables
npx prisma db seed            # adds sample data
npm run dev                   # starts on port 8000
```

Frontend:

```
npm install
npm run dev                   # starts on port 3000, proxies API to 8000
```
