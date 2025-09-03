# Note — Full‑Stack Note‑Taking Application

A full‑stack note‑taking app. The frontend (React) provides text notes, checklists, images and drawings, color/tagging (labels), pinning, reminders, multi‑select and trash management. The backend (PHP + MySQL) exposes REST‑style endpoints for notes, labels, auth, uploads, and search.

This repo currently contains two frontends:
- Primary: Create React App under Note/client (source of truth)
- Secondary (optional): Vite + React + TypeScript template at Note/ (minimal, for future migration only)

Backend is under Note/server (PHP API served via built‑in web server for dev).


## Contents
- Features
- Project Structure
- Tech Stack
- Local Development (Setup & Run)
- Database & Migrations
- API Overview
- Testing Strategy
- Conventions & Best Practices
- Troubleshooting


## Features
- Notes: text, checklist (ordered items), image, drawing
- Organization: color, labels (many‑to‑many), pinning
- Reminders: ISO or datetime-local inputs normalized by backend
- Bulk actions: multi‑select, trash management (soft delete, permanent delete)
- Search: title/content search
- Uploads: static file handling for images (validation recommended)


## Project Structure
Top‑level layout (primary app lives under Note/):

- Note/
  - client/ — Primary React app (Create React App)
    - src/components — UI components (modals, editors, note cards, lists, toolbars, etc.)
    - src/context — React Contexts (AuthContext, SettingsContext, ThemeContext)
    - src/hooks — Custom hooks (e.g., useLabels, useNoteSelection)
    - jest.config.js, jest.setup.js — Jest + Testing Library config
    - package.json — CRA scripts (start, build, test)
  - server/ — PHP API
    - api/ — Endpoints (index.php for notes CRUD, labels.php, search.php, auth/*, uploads/*)
    - db/ — DB connection, migrations, helpers
      - migrations/ — SQL migrations for schema changes
      - db-connection.php — PDO connection factory
    - lib/ — Shared PHP utilities
    - start-server.sh — Dev server (php -S ... -t api)
  - src/ — Minimal Vite template scaffolding (TypeScript)
  - package.json — Vite React TypeScript template (secondary; see Do’s/Don’ts)
  - vite.config.ts, tsconfig.* — Vite + TS config
  - eslint.config.js — ESLint config for the Vite/TS template

Key entry points and configuration:
- Frontend (primary): Note/client/src/index.js (CRA runtime at http://localhost:3000)
- Backend: Note/server/start-server.sh (serves api/ at http://localhost:8000)
- CORS: api/index.php uses "*"; api/search.php restricts to http://localhost:3000 — standardize per environment
- DB credentials currently hardcoded in server (db-connection.php, api/index.php) — externalize to env


## Tech Stack
- Frontend (primary): React 19, react-dom, react-router-dom v6, react-scripts, axios
- UX: @hello-pangea/dnd, react-window, @heroicons/react, lucide-react
- Testing: Jest, @testing-library/*, jest-dom
- Backend: PHP (PDO + MySQL)


## Local Development (Setup & Run)
Prerequisites:
- Node.js 18+ and npm
- PHP 8+
- MySQL 8+ (or compatible)

1) Database
- Create a database and user in MySQL.
- Apply the SQL migrations in Note/server/db/migrations (see Database & Migrations).
- Update backend DB credentials (recommended via environment variables).

2) Backend
- From Note/server: ./start-server.sh
- This runs the PHP built‑in server at http://localhost:8000 serving the api/ directory.

3) Frontend (primary CRA)
- From Note/client:
  - npm install
  - npm start
- App runs at http://localhost:3000 (CRA). Ensure CORS aligns with backend.

4) Optional Vite template (secondary)
- From Note/:
  - npm install
  - npm run dev
- This template is not wired to the PHP API; keep primary development in Note/client.

Configuration
- Server environment variables (recommended; create a Note/server/.env with values like):
  - DB_HOST=localhost
  - DB_NAME=notes
  - DB_USER=notes_user
  - DB_PASS=change_me
- Current code has credentials hardcoded; plan is to externalize to env. If you change credentials, also update Note/server/db/db-connection.php (temporary until env is wired).


## Database & Migrations
Schema highlights:
- notes: id, title, content, type (note | list | image | drawing), color, pinned, image_url, drawing_data, status, reminder, created_at
- note_items: checklist entries (position-ordered)
- labels: id, name, color
- note_labels: note_id, label_id (many-to-many)

To initialize DB:
- Ensure the database exists and your user has privileges.
- Apply SQL files in Note/server/db/migrations in order. Example:
  - 2024_06_01_add_note_type_and_note_items.sql
  - 2024_06_02_add_drawing_data_to_notes.sql
  - 2024_06_03_add_status_to_notes.sql
  - 2024_06_04_add_reminder_to_notes.sql
  - 2024_06_05_add_labels_and_note_labels.sql


## API Overview
Base URL: http://localhost:8000 (served from Note/server/api)

Notes (server/api/index.php)
- GET /api
  - Query filters: status, type, label, reminder=not_null
  - Returns notes with listItems and labels
- POST /api
  - Creates a note; normalizes list content and reminder formats; assigns labels; inserts note_items for lists
- PUT/PATCH /api?id={id}
  - Updates note fields; normalizes pinned/reminder; rewrites note_items and note_labels if provided
- DELETE /api?id={id}
  - Soft delete by default; permanent delete when permanent=1 (cleans related tables within a transaction)

Labels (server/api/labels.php)
- CRUD for labels; consistent JSON responses with proper codes

Search (server/api/search.php)
- LIKE search on title/content; currently CORS-limited to http://localhost:3000

Auth & uploads
- See server/api/auth/* and server/api/uploads/* for development endpoints

Response shape guideline
- { error?: boolean, message?: string } or resource payloads; avoid mixing arbitrary fields


## Testing Strategy (Frontend)
- Frameworks: Jest + React Testing Library (jsdom)
- Config: Note/client/jest.config.js, Note/client/jest.setup.js
- Example test: Note/client/src/App.test.js
- Run tests: cd Note/client && npm test
- Guidelines:
  - Unit: helpers, hooks, small components
  - Integration: components with data fetching (mock axios or use MSW)
  - Use MSW for realistic API mocking; mock axios for unit tests
  - Aim for 80%+ coverage on critical UI logic (selection, bulk actions, reminders)


## Conventions & Best Practices
Frontend
- Functional components + hooks (no class components)
- Naming: Components PascalCase; hooks use* camelCase; co-locate *.test.js
- State: keep local for presentation; use contexts for cross-cutting concerns (Auth, Settings, Theme)
- HTTP: centralize axios baseURL and interceptors in a single API module; handle errors with user-safe messages
- Styling: Tailwind optional; be consistent
- TypeScript: CRA is JS-first; avoid mixing TS without proper setup. The Vite template is TS-ready but secondary for now.

Backend
- PDO prepared statements for all queries; validate & sanitize inputs
- Error handling: try/catch DB ops; consistent JSON + HTTP codes
- Transactions for multi-step writes
- CORS: centralize headers via a common include to avoid drift (search.php vs index.php differ)
- Externalize DB credentials to environment variables; do not commit secrets

Do’s and Don’ts
- Do keep client changes inside Note/client
- Do run DB migrations under Note/server/db/migrations
- Don’t mix CRA client and Vite template development streams
- Don’t hardcode credentials or environment-specific URLs in code


## Troubleshooting
- 401/403 or CORS errors: ensure backend at http://localhost:8000 and CORS headers allow http://localhost:3000
- DB connection failures: verify credentials and that migrations have been applied
- Large lists performance: prefer react-window, avoid O(n^2) during drag/drop


## Roadmap (maintenance tasks)
- Centralize CORS headers into a shared PHP include and standardize origins per environment
- Externalize DB credentials into .env with a loader in db-connection.php
- Add backend tests (PHPUnit/Pest) and API contract tests
- Add client src/api module to centralize axios
