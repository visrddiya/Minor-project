# QueueSphere - Enterprise Smart Queue Management System

QueueSphere is an enterprise-grade Smart Queue Management System (QMS) designed for healthcare facilities, financial institutions, civic service hubs, educational organizations, and retail businesses.

---

## 🌟 Features Overview

- **📱 Touchscreen Self-Service Kiosk (`/kiosk`)**: Ticket dispenser supporting department selection, customer contact info, and priority tiering (*Normal, Senior/Access, VIP, Emergency*). Generates instant printable token receipts with QR codes.
- **🖥️ Waiting Room Digital Signage TV (`/display`)**: Dark-mode signage display with animated "NOW CALLING" banner, counter station assignments, upcoming queue list, and Web Speech API audio chime announcements.
- **👥 Staff Counter Operator Portal (`/counter`)**: Interactive station dashboard allowing staff to call next waiting customer, recall voice announcement, mark complete, skip/no-show, put on hold, or transfer to another department.
- **🔍 Public Live Ticket Tracker (`/track`)**: Mobile ticket tracking portal featuring real-time queue position timeline (*WAITING -> CALLING -> SERVING -> COMPLETED*), wait countdown, and SMS alert toggles.
- **📅 Online Appointment Booking (`/appointments`)**: Reservation portal allowing customers to book time slots and check-in upon arrival for instant priority queue token generation.
- **📊 Executive Admin Dashboard (`/admin`)**: Telemetry control center displaying KPI metrics, department load progress bars, active counter states, filterable master token audit log, and **CSV / JSON Report Exporters**.
- **🔐 User Session & Authentication (`/login`, `/register`)**: JWT-based auth with Role-Based Access Control (`SUPER_ADMIN`, `BRANCH_ADMIN`, `RECEPTIONIST`, `STAFF`, `CUSTOMER`), demo login pre-fills, and dynamic header session navbar.
- **🌐 Internationalization (i18n)**: Language selector supporting English (EN), Spanish (ES), French (FR), and Hindi (HI).

---

## 🏗️ Architecture & Technology Stack

### Frontend Architecture
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons, Custom Design Tokens
- **Routing**: React Router DOM (`v6`)
- **State & Data**: TanStack Query (`v5`), React Context API (`QueueContext`), Axios client services

### Backend API Architecture
- **Runtime**: Node.js, Express, TypeScript
- **Database ORM**: PostgreSQL with Prisma ORM (`v5`)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt password hashing
- **Validation**: Zod request schemas, Morgan logging, CORS

---

## 📁 Repository Structure

```
QueueSphere/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Navbar, TokenTicketModal)
│   │   ├── context/            # React QueueContext State Provider
│   │   ├── lib/                # Axios Client, i18n, & CSV exportUtils
│   │   ├── pages/              # 8 Application Pages (Kiosk, Counter, Display, Track, etc.)
│   │   ├── services/           # API Services Layer (tokenService, branchService, etc.)
│   │   ├── types/              # TypeScript Type Interfaces
│   │   ├── App.tsx             # Route Configuration
│   │   └── main.tsx            # Entry point
│   ├── Dockerfile              # Multi-stage Client Docker container
│   ├── nginx.conf              # Nginx Web Server config
│   └── package.json
│
├── server/                     # Backend Express API Service
│   ├── prisma/                 # Database ORM Schema & Seed Script
│   │   ├── schema.prisma       # Prisma Models (User, Branch, Department, Token, etc.)
│   │   └── seed.ts             # Initial Database Seeder
│   ├── src/
│   │   ├── controllers/        # REST Controllers (Auth, Branch, Token, Counter, etc.)
│   │   ├── middlewares/        # JWT Authentication & RBAC Middlewares
│   │   ├── routes/             # Express Router Modules
│   │   ├── __tests__/          # Automated Jest & Supertest Integration Tests
│   │   └── app.ts              # Express Server Setup
│   ├── Dockerfile              # Multi-stage Server Docker container
│   └── package.json
│
└── docker-compose.yml          # Full-stack Docker Compose arrangement
```

---

## 🚀 Quick Start Guide

### Option 1: One-Command Docker Deployment (Recommended)
```bash
docker-compose up --build
```
*App will run with PostgreSQL on port 5432, Express Server on port 5000, and Nginx Client on http://localhost:80*

### Option 2: Local Development Setup
#### 1. Backend API Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db seed
npm run dev
```
*Backend API will start on http://localhost:5000*

#### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend Web Application will start on http://localhost:5173*

---

## 🧪 Automated Testing & Build

### Run Backend Unit & Integration Tests
```bash
cd server
npm test
```

### Build Production Assets
```bash
# Build Client
cd client && npm run build

# Build Server
cd server && npm run build
```

---

## 🛡️ License
Copyright © 2026 QueueSphere Inc. All Rights Reserved.
