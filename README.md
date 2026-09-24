# RackDraw 🌐

*Read this in other languages: [English](#english) | [Español](#español)*

---

<a id="english"></a>
## 🇬🇧 English

> **Visual rack management & network cabling tool**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)

RackDraw is a browser-based tool for designing and documenting server rack layouts and network cabling infrastructure. It provides an interactive 48U rack canvas where technicians can place equipment, draw color-coded cable connections, and maintain a live cable inventory — all backed by a persistent PostgreSQL database. Rack diagrams and cable lists can be exported to PDF and CSV for field documentation.

### Features
- 🖥️ **Visual 48U Rack Grid** — drag-and-drop canvas for laying out rack equipment
- 🎛️ **Device Management** — add, clone, edit, and delete rack-mounted devices with ease
- 🔌 **Color-Coded Cabling** — draw and label connections using cable types: CAT6, Fiber SM, Fiber MM, and Power
- 📋 **WireList Panel & CSV Export** — live cable inventory sidebar, fully exportable to Excel
- 🖨️ **Print / PDF Export** — export the rack diagram to a printer-friendly PDF
- 🌗 **Dark / Light Theme & i18n** — native support for English and Spanish, with dark/light modes
- 🐳 **Docker Ready** — spin up the full stack (frontend, backend, database) with a single command

### Quick Start
```bash
git clone https://github.com/CrowPlasma/RackDraw.git
cd RackDraw
cp .env.example .env
docker compose up --build
```
*Frontend: http://localhost:5173 | Backend API: http://localhost:3000*

---

<a id="español"></a>
## 🇪🇸 Español

> **Herramienta visual de gestión de gabinetes y cableado de red**

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)

RackDraw es una herramienta para navegadores diseñada para documentar la distribución de equipos en racks de servidores y la infraestructura de cableado. Proporciona un lienzo interactivo de 48U donde los técnicos pueden colocar equipos, trazar conexiones codificadas por colores y mantener un inventario en vivo, todo respaldado por una base de datos PostgreSQL. Los diagramas y el Wirelist se pueden exportar a PDF y CSV.

### Características
- 🖥️ **Grid Visual de 48U** — lienzo interactivo para posicionar el hardware
- 🎛️ **Gestión de Equipos** — añadir, clonar, editar y eliminar hardware fácilmente
- 🔌 **Cableado por Colores** — traza y etiqueta conexiones físicas (CAT6, Fibra, Energía)
- 📋 **Panel WireList y Exportación CSV** — bitácora en vivo, exportable a Excel
- 🖨️ **Exportación a PDF** — genera memorias técnicas listas para impresión
- 🌗 **Temas y Multilenguaje** — soporte nativo en Inglés y Español, modo claro y oscuro
- 🐳 **Listo para Docker** — despliega la base de datos, backend y frontend con un solo comando

### Inicio Rápido
```bash
git clone https://github.com/CrowPlasma/RackDraw.git
cd RackDraw
cp .env.example .env
docker compose up --build
```
*Frontend: http://localhost:5173 | Backend API: http://localhost:3000*
