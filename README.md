# RackDraw

> **Visual rack management & network cabling tool**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)

RackDraw is a browser-based tool for designing and documenting server rack layouts and network cabling infrastructure. It provides an interactive 48U rack canvas where technicians can place equipment, draw color-coded cable connections, and maintain a live cable inventory — all backed by a persistent PostgreSQL database. Rack diagrams and cable lists can be exported to PDF for field documentation.

---

## Features

- 🗄️ **Visual 48U Rack Grid** — drag-and-drop canvas for laying out rack equipment unit by unit
- ➕ **Device Management** — add, move, resize, and delete rack-mounted devices with ease
- 🔌 **Color-Coded Cabling** — draw and label connections using cable types: CAT6, Fiber SM, Fiber MM, and Power
- 📋 **WireList Panel** — live cable inventory sidebar listing every connection in the rack
- 🖨️ **Print / PDF Export** — export the rack diagram and wire list to a printer-friendly PDF
- 🌗 **Dark / Light Theme** — toggle between themes for comfortable use in any environment
- 🐳 **Docker Ready** — spin up the full stack (frontend, backend, database) with a single command

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| **Frontend**   | React 18, TypeScript, Zustand, Vite             |
| **Backend**    | Node.js, Express, TypeScript, Prisma ORM        |
| **Database**   | PostgreSQL 16                                   |
| **Infrastructure** | Docker, Docker Compose, Nginx               |

---

## Quick Start (Local Development)

Ensure you have **Docker** and **Docker Compose** installed, then run:

```bash
# Clone the repository
git clone https://github.com/your-org/rackdraw.git
cd rackdraw

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your preferred settings

# Start the full stack
docker compose up --build

# The app will be available at:
#   Frontend → http://localhost:5173
#   Backend API → http://localhost:3000
```

To stop the stack:

```bash
docker compose down
```

To rebuild after code changes:

```bash
docker compose up --build --force-recreate
```

---

## Production Deployment

For production setup (Nginx reverse proxy, environment hardening, and TLS guidance), see the dedicated deployment guide:

📖 [`rackdraw-deploy/README.md`](./rackdraw-deploy/README.md)

---

## Load Demo Data

To seed the database with sample racks, devices, and cables for a quick demo:

```bash
docker compose exec backend npx prisma db seed
```

---

## Environment Variables

The following variables should be defined in your `.env` file at the project root:

| Variable              | Description                                      | Default                  |
|-----------------------|--------------------------------------------------|--------------------------|
| `DATABASE_URL`        | PostgreSQL connection string (Prisma format)     | *(required)*             |
| `POSTGRES_USER`       | PostgreSQL username                              | `rackdraw`               |
| `POSTGRES_PASSWORD`   | PostgreSQL password                              | *(required)*             |
| `POSTGRES_DB`         | PostgreSQL database name                         | `rackdraw`               |
| `PORT`                | Backend API port                                 | `3000`                   |
| `VITE_API_BASE_URL`   | Frontend base URL for API calls                  | `http://localhost:3000`  |
| `NODE_ENV`            | Runtime environment (`development`/`production`) | `development`            |

---

## Contributing

We welcome contributions of all kinds — bug fixes, features, documentation, and tests.

1. **Fork** the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes following the [contribution guidelines](./CONTRIBUTING.md)
3. **Commit** with a clear message following [Conventional Commits](https://www.conventionalcommits.org/)
4. **Push** your branch and open a **Pull Request** against `main`
5. A maintainer will review your PR and may request changes before merging

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) for code style notes, dev environment setup, and issue reporting guidelines.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
