# Contributing to RackDraw

Thank you for your interest in contributing! This guide covers how to set up a local development environment, the code style expectations, the pull request process, and how to report issues.

---

## Table of Contents

1. [Dev Environment Setup](#dev-environment-setup)
2. [Code Style](#code-style)
3. [Pull Request Process](#pull-request-process)
4. [Reporting Issues](#reporting-issues)

---

## Dev Environment Setup

### Prerequisites

| Tool              | Minimum Version |
|-------------------|-----------------|
| Node.js           | 18.x            |
| npm               | 9.x             |
| Docker            | 24.x            |
| Docker Compose    | 2.x             |
| Git               | 2.x             |

### Steps

```bash
# 1. Fork and clone the repo
git clone https://github.com/<your-username>/rackdraw.git
cd rackdraw

# 2. Set up environment variables
cp .env.example .env
# Open .env and fill in required values (DATABASE_URL, POSTGRES_PASSWORD, etc.)

# 3. Start the database
docker compose up -d postgres

# 4. Install backend dependencies and run migrations
cd backend
npm install
npx prisma migrate dev
cd ..

# 5. Install frontend dependencies
cd frontend
npm install
cd ..

# 6. Start both dev servers
#    Terminal A — backend
cd backend && npm run dev

#    Terminal B — frontend
cd frontend && npm run dev
```

The frontend dev server will be available at `http://localhost:5173` and will proxy API requests to the backend on port `3000`.

---

## Code Style

### TypeScript

- **Strict mode is required.** All code must pass `tsc --strict` with no errors.
- Prefer explicit return types on exported functions and React components.
- Avoid `any`; use `unknown` with appropriate narrowing instead.
- Use `interface` for object shapes and `type` for unions/intersections.

### React & Frontend

- Use **functional components** with hooks only — no class components.
- Global state lives in **Zustand** stores. Keep component-local state in `useState` / `useReducer`.
- Component files follow the naming convention: `PascalCase.tsx`.
- Co-locate styles with their components when using CSS Modules.

### UI Labels (Internationalization)

> **Note:** The application UI uses **Spanish labels** throughout. All user-facing strings (button text, panel headers, tooltips, form labels, error messages) must be written in Spanish. Code identifiers (variable names, function names, type names) remain in English.

### Backend

- Express route handlers must be typed with `Request` / `Response` / `NextFunction` from `express`.
- All Prisma queries belong in service files, not directly in route handlers.
- Use `async/await` consistently; avoid raw Promise chains.

### Formatting & Linting

The project uses **ESLint** and **Prettier**. Before committing, run:

```bash
npm run lint   # Check for linting errors
npm run format # Auto-format with Prettier
```

A pre-commit hook (via Husky) will enforce these checks automatically.

---

## Pull Request Process

1. **Branch naming:** Use a descriptive prefix:
   - `feat/` — new feature
   - `fix/` — bug fix
   - `docs/` — documentation only
   - `refactor/` — code restructuring without behavior change
   - `chore/` — tooling, deps, CI

2. **Commit messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(cables): add fiber MM cable type to palette
   fix(rack): prevent device overlap on drag-drop
   docs(readme): update quick-start commands
   ```

3. **Before opening a PR:**
   - Ensure `npm run lint` and `npm run build` pass with no errors.
   - Add or update tests where relevant.
   - Update documentation (README, inline comments) if you changed behavior.

4. **PR description:** Fill in the PR template. Clearly describe *what* changed and *why*.

5. **Review:** At least one maintainer approval is required before merging. Address all requested changes before re-requesting review.

6. **Merging:** PRs are merged using **Squash and Merge** to keep the `main` branch history clean.

---

## Reporting Issues

Before opening an issue, please search [existing issues](https://github.com/your-org/rackdraw/issues) to avoid duplicates.

When filing a **bug report**, include:

- **Steps to reproduce** — the minimum actions needed to trigger the bug
- **Expected behavior** — what you expected to happen
- **Actual behavior** — what actually happened
- **Environment** — browser version, OS, Docker version, Node.js version
- **Screenshots or logs** — if applicable

When filing a **feature request**, include:

- A clear description of the problem the feature would solve
- A proposed solution or design sketch (even rough is helpful)
- Any alternatives you considered

Thank you for helping make RackDraw better! 🙌
