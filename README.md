# GenStudio

GenStudio is a full-stack AI chat workspace built on the Gemini API. It lets a
signed-in user run multiple saved conversations, define reusable prompt
presets (system prompt + temperature), and track their own token usage —
with a free-plan daily message cap enforced server-side.

## Why this exists

A single API key check isn't a product. GenStudio wraps the Gemini API in a
real multi-user workspace: persistent conversation history, prompt presets
so you're not retyping the same instructions, and per-user usage accounting
so a free/pro plan split is actually enforceable.

## Features

- **Auth** — JWT-based register/login with bcrypt password hashing.
- **Conversations** — create, rename, delete; full message history stored
  per conversation and replayed as context on every turn.
- **Presets** — reusable system prompts with a configurable temperature,
  attachable to a conversation.
- **Usage tracking** — every turn logs prompt/completion tokens; a summary
  endpoint rolls that up into today vs. all-time stats.
- **Plan limits** — free-plan users are capped at 30 messages/day; pro users
  are unmetered. Enforced in middleware, not just the UI.

## Tech stack

| Layer    | Choice                                      |
|----------|-----------------------------------------------|
| Frontend | React (Vite), React Router                    |
| Backend  | Node.js, Express                               |
| Database | MongoDB (Mongoose)                             |
| Auth     | JSON Web Tokens, bcrypt password hashing       |
| AI       | Google Gemini API (`@google/genai`)            |

Everything is plain JavaScript — no TypeScript build step.

## Project structure

```
genai-repo/
├── backend/           Express API + MongoDB
│   └── src/
│       ├── db/            mongoose connection
│       ├── middleware/     auth, plan limits, error handling
│       ├── models/         User, Conversation, Message, Preset, UsageLog
│       ├── routes/         auth, conversations, messages, presets, usage
│       ├── services/       gemini.js — Gemini API wrapper
│       └── server.js
└── frontend/          React (Vite) workspace UI
    └── src/
        ├── api/
        ├── context/
        ├── components/
        └── pages/
```

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed            # optional: creates a demo pro user
npm run dev
```

The API listens on `http://localhost:4000` by default. The seed script
creates `demo@genstudio.dev` / `demo1234` on the pro plan with a starter
preset.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server listens on `http://localhost:5173` and proxies `/api` to the
backend.

## API overview

| Method | Route                          | Description                          |
|--------|----------------------------------|---------------------------------------|
| POST   | `/api/auth/register`            | Create an account                     |
| POST   | `/api/auth/login`                | Get a JWT                             |
| GET    | `/api/conversations`             | List the user's conversations         |
| POST   | `/api/conversations`             | Create a conversation                 |
| GET    | `/api/conversations/:id`         | Get a conversation with its messages  |
| PUT    | `/api/conversations/:id`         | Rename a conversation                 |
| DELETE | `/api/conversations/:id`         | Delete a conversation                 |
| POST   | `/api/messages/:conversationId`  | Send a message, get the Gemini reply  |
| GET    | `/api/presets`                   | List presets                          |
| POST   | `/api/presets`                   | Create a preset                       |
| PUT    | `/api/presets/:id`                | Update a preset                       |
| DELETE | `/api/presets/:id`                | Delete a preset                       |
| GET    | `/api/usage/summary`             | Today and all-time token usage        |

All routes except `/api/auth/*` require `Authorization: Bearer <token>`.
