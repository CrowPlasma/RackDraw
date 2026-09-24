# RackDraw 🔌

*Read this in other languages: [English](#english) | [Español](#español)*

---

<a id="english"></a>
## 🇺🇸 English

> **Professional IT Infrastructure & Visual Rack Management Platform**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)

**RackDraw** is a modern, browser-based platform designed for network engineers, system administrators, and datacenter technicians. It provides a visual, highly interactive environment to document server cabinets, plan hardware deployments, and trace physical port-to-port connections. 

Whether you are managing a small MDF closet or a multi-rack datacenter, RackDraw bridges the gap between messy spreadsheets and expensive enterprise DCIM (Data Center Infrastructure Management) software by offering a fast, intuitive, and exportable documentation tool.

### ✨ Key Features

- 🏗️ **Dynamic Visual Rack Builder** — Interactive drag-and-drop canvas to mount, move, and organize IT hardware inside customizable server cabinets. Not limited to standard heights; configure it for your specific infrastructure needs.
- 🔌 **Precise Port-to-Port Cabling** — Trace physical connections down to the specific interface. Differentiate media types natively: **Copper (CAT6/6a)**, **Fiber (Single-Mode / Multi-Mode)**, and **Power Lines**, each with distinct color-coding and routing logic.
- 📋 **Live WireList (Cable Inventory)** — Automatically generates a real-time cabling ledger ("WireList") as you visually connect devices. Easily filter, search, and audit patch cables.
- 📄 **Technical Reports (PDF & CSV)** — Instantly generate print-ready PDF Technical Reports for field technicians, or export the full connection matrix to CSV/Excel for procurement and auditing.
- 🏢 **Multi-Project Management** — Organize multiple sites, floors, or datacenters into distinct Projects, each containing multiple racks.
- 🌍 **Native Localization & Theming** — Built-in seamless toggling between English and Spanish, alongside deep Dark/Light mode support.
- 🐳 **Self-Hosted & Docker Ready** — Full stack (React, Node.js, PostgreSQL) containerized for instant deployment via Docker Compose.

### 🛠️ Tech Stack
* **Frontend:** React 18, Vite, TypeScript, Zustand, Lucide Icons, i18next
* **Backend:** Node.js, Express, TypeScript, Prisma ORM
* **Database:** PostgreSQL 16
* **Deployment:** Docker, Docker Compose

### 🚀 Quick Start (Local Development)
```bash
# 1. Clone the repository
git clone https://github.com/CrowPlasma/RackDraw.git
cd RackDraw

# 2. Set up environment variables
cp rackdraw-deploy/.env.example rackdraw-deploy/.env

# 3. Spin up the stack
docker compose up --build
```
* **Frontend UI:** `http://localhost:5173`
* **Backend API:** `http://localhost:3000`

---

<a id="español"></a>
## 🇪🇸 Español

> **Plataforma Profesional de Gestión Visual de Racks e Infraestructura TI**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)

**RackDraw** es una plataforma moderna para navegador diseñada para ingenieros de red, administradores de sistemas y técnicos de centros de datos. Proporciona un entorno visual y altamente interactivo para documentar gabinetes de servidores, planificar despliegues de hardware y trazar conexiones físicas puerto a puerto.

Ya sea que gestiones un pequeño site de telecomunicaciones o un centro de datos con múltiples racks, RackDraw cierra la brecha entre las hojas de cálculo desordenadas y el costoso software DCIM empresarial, ofreciendo una herramienta de documentación rápida, intuitiva y fácil de exportar.

### ✨ Características Principales

- 🏗️ **Constructor Visual de Racks** — Lienzo interactivo para montar, mover y organizar hardware IT dentro de los gabinetes. Se adapta a diferentes alturas y necesidades de infraestructura, no está limitado a estándares fijos.
- 🔌 **Cableado Preciso Puerto-a-Puerto** — Traza conexiones físicas hasta la interfaz específica. Diferencia los medios físicos de forma nativa: **Cobre (CAT6/6a)**, **Fibra (Monomodo / Multimodo)** y **Líneas de Energía**, cada uno con su código de color y lógica de enrutamiento.
- 📋 **WireList en Vivo (Inventario de Cables)** — Genera automáticamente una bitácora de cableado en tiempo real a medida que conectas los dispositivos visualmente. Filtra, busca y audita cables fácilmente.
- 📄 **Memorias Técnicas (PDF y CSV)** — Genera al instante Reportes Técnicos en PDF listos para impresión para los técnicos en campo, o exporta la matriz completa de conexiones a CSV/Excel.
- 🏢 **Gestión Multi-Proyecto** — Organiza múltiples sitios, pisos o centros de datos en Proyectos separados, cada uno con múltiples racks.
- 🌍 **Multilenguaje y Temas** — Soporte nativo y fluido entre Inglés y Español, además de un diseño adaptativo con Modo Claro y Oscuro.
- 🐳 **Auto-alojado y Listo para Docker** — Stack completo (React, Node.js, PostgreSQL) en contenedores para un despliegue instantáneo mediante Docker Compose.

### 🛠️ Tecnologías
* **Frontend:** React 18, Vite, TypeScript, Zustand, Lucide Icons, i18next
* **Backend:** Node.js, Express, TypeScript, Prisma ORM
* **Base de Datos:** PostgreSQL 16
* **Despliegue:** Docker, Docker Compose

### 🚀 Inicio Rápido (Desarrollo Local)
```bash
# 1. Clonar el repositorio
git clone https://github.com/CrowPlasma/RackDraw.git
cd RackDraw

# 2. Configurar variables de entorno
cp rackdraw-deploy/.env.example rackdraw-deploy/.env

# 3. Levantar los contenedores
docker compose up --build
```
* **Interfaz Frontend:** `http://localhost:5173`
* **API Backend:** `http://localhost:3000`
