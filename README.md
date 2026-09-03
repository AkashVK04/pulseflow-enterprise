# PulseFlow Enterprise Platform

> **An enterprise-oriented, AI-powered work management, agile execution, and delivery intelligence platform.**

![Architecture](https://img.shields.io/badge/Architecture-Spring%20Boot%203.2%20%7C%20React%2019%20%7C%20PostgreSQL%2018-blue?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Spring%20Security%206%20%7C%20JJWT%20%7C%20BCrypt-emerald?style=for-the-badge)
![Build Status](https://img.shields.io/badge/Tests-24%2F24%20Passed-brightgreen?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Render%20%7C%20Docker%20%7C%20Nginx-purple?style=for-the-badge)

---

## 📖 1. Project Overview

**PulseFlow Enterprise** is a responsive, production-ready work management and engineering intelligence platform built for modern product and operations teams. Inspired by systems like Linear, Stripe, and Vercel, PulseFlow unifies task management, agile sprint planning, interactive effort tracking, security audit logging, and server-side Generative AI insights into a single unified enterprise application.

### Key Capabilities & Problem Solved
Modern enterprise organizations often fragment operational workflows across disparate tools for task tracking, time logging, administrative security auditing, and AI capabilities. PulseFlow resolves this fragmentation by offering:
- **Centralized Work Orchestration**: Multi-project portfolio tracking, Kanban status transitions, sprint planning, and task comments.
- **Generative AI Engineering Intelligence**: Server-side Google Gemini 3.6 Flash integration for task decomposition, sprint standup briefings, and automated risk audits.
- **Enterprise Security Architecture**: Role-Based Access Control (RBAC), JWT authentication, BCrypt password hashing, and continuous audit trail logging.
- **Full-Stack Performance**: Responsive production web application with sub-100ms warm API responses observed during production testing.

---

## 🚀 2. Live Production Deployment & Demo Access

- **Live Production Domain**: [https://pulseflow-enterprise.onrender.com](https://pulseflow-enterprise.onrender.com/)
- **Swagger / OpenAPI Interactive UI**: [https://pulseflow-enterprise.onrender.com/swagger-ui/index.html](https://pulseflow-enterprise.onrender.com/swagger-ui/index.html)
- **OpenAPI v3 JSON Specification**: [https://pulseflow-enterprise.onrender.com/v3/api-docs](https://pulseflow-enterprise.onrender.com/v3/api-docs)
- **Actuator Production Health**: [https://pulseflow-enterprise.onrender.com/actuator/health](https://pulseflow-enterprise.onrender.com/actuator/health)
- **GitHub Repository**: [https://github.com/AkashVK04/pulseflow-enterprise.git](https://github.com/AkashVK04/pulseflow-enterprise.git)
- **Verified Release Commit**: `1a0fa71`

### Public Demo / Test Account
To inspect the production platform as a Super Administrator:
- **Email**: `sarah.connor@pulseflow.io`
- **Password**: `Password123!`

---

## ✨ 3. Core Feature Matrix

### 🔐 Authentication & Security Architecture
- **JWT Session Tokens**: HMAC-SHA256 signed access and refresh tokens.
- **BCrypt Password Hashing**: Passwords stored via 10-round salted BCrypt hashing.
- **Spring Security 6 & RBAC**: Method-level `@PreAuthorize` guards all endpoints.
- **401 vs 403 Enforcement**: Strict distinction between unauthenticated requests (401) and unauthorized role access attempts (403).

### 📋 Project & Task Management
- **Project Portfolios**: Key prefixes, budget hours, logged hours, and risk indicators.
- **Kanban & Backlog**: Drag-and-drop status transitions (`Backlog` → `To Do` → `In Progress` → `In Review` → `Completed`).
- **Subtasks & Comments**: Nested task checklists and comment discussion threads.

### ⚡ Logistics & Time Tracking
- **Sprint Manager**: Sprint velocity points tracking and iteration planning.
- **Stopwatch Time Tracker**: Interactive live stopwatch with task assignment and effort logging.

### 🛡️ Enterprise Governance & Admin
- **Immutable Audit Trail**: Security event logging for compliance and auditing.
- **User Provisioning & Lock Controls**: Provision users, mutate role assignments, and lock/unlock accounts.
- **Feature Flags & Cron Jobs**: Toggle system flags dynamically and trigger background scheduled jobs.
- **CSV Data Exporters**: Real-time CSV file generation for Task Inventories and Audit Trails.

### 🤖 Generative AI Copilot (Gemini 3.6 Flash)
- **AI Task Decomposition (`POST /api/ai/decompose`)**: Auto-decomposes tasks into subtasks with hour estimates.
- **AI Standup Briefing (`POST /api/ai/standup`)**: Generates sprint achievement summaries and risk alerts.
- **AI Risk Audit (`POST /api/ai/risk-audit`)**: Scans portfolio telemetry for capacity warnings and delay estimates.
- **AI Copilot Drawer (`POST /api/ai/chat`)**: Interactive conversational assistant for workspace telemetry.

---

## 🏛️ 4. System Architecture

```
                                  [ USER BROWSER ]
                                         │
                                   HTTPS / Port 443
                                         │
                                         ▼
                   ┌───────────────────────────────────────────┐
                   │             NGINX REVERSE PROXY           │
                   │                (Port 10000)               │
                   └─────────────────────┬─────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
             Static Assets / SPA                      /api/* Proxy
                    │                                         │
                    ▼                                         ▼
     ┌─────────────────────────────┐           ┌─────────────────────────────┐
     │   React 19 + TypeScript     │           │   Spring Boot 3.2 (Java 21) │
     │   (Vite 6, Tailwind, Lucide) │           │      (Port 8080 Internal)   │
     └─────────────────────────────┘           └──────────────┬──────────────┘
                                                              │
                                        ┌─────────────────────┼─────────────────────┐
                                        │                     │                     │
                                        ▼                     ▼                     ▼
                             ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
                             │  Spring Security  │  │ Flyway Migration  │  │ Gemini 3.6 Flash  │
                             │  & JJWT Filter    │  │ (V1 / V2 / V3)    │  │    AI Engine      │
                             └──────────┬────────┘  └──────────┬────────┘  └───────────────────┘
                                        │                     │
                                        └──────────┬──────────┘
                                                   │
                                                   ▼
                                     ┌───────────────────────────┐
                                     │    PostgreSQL 18.6 DB     │
                                     │      (pulseflow_db)       │
                                     └───────────────────────────┘
```

---

## 🛠️ 5. Technology Stack

### Frontend
- **Framework**: React 19.0 (`react@19.0.1`, TypeScript 5.8)
- **Build Tooling**: Vite 6.2 (`vite@6.2.3`) + ESBuild bundler
- **Styling & UI**: Tailwind CSS v4 (`tailwindcss@4.1.14`) + Lucide React (`lucide-react@0.546.0`)
- **Data Visualization**: Recharts 3.10 (`recharts@3.10.1`)
- **HTTP Client**: Native Fetch API wrapper (`src/lib/api.ts`)

### Backend
- **Runtime**: JDK 21 (Java 21)
- **Framework**: Spring Boot 3.2.3 (Spring Web, Spring Data JPA, Spring Security 6)
- **Database Engine**: PostgreSQL 18 (18.6)
- **Database Migrations**: Flyway 9.22 (`db/migration/V1__init.sql`, `V2__seed_data.sql`, `V3__fix_seed_password_hashes.sql`)
- **Security & JWT**: JJWT 0.12.5, BCrypt
- **API Documentation**: SpringDoc OpenAPI 2.3.0 (`springdoc-openapi-starter-webmvc-ui`)
- **Build System**: Maven (`pom.xml`)

### Infrastructure
- **Reverse Proxy**: Nginx
- **Containerization**: Multi-stage Docker (`Dockerfile`)
- **Cloud Host**: Render

---

## 🔐 6. Security Architecture & RBAC Matrix

### Authentication Flow
1. Client sends credentials to `POST /api/auth/login`.
2. Backend verifies email and BCrypt hash in PostgreSQL.
3. Upon validation, backend returns HMAC-SHA256 signed JWT (`accessToken`).
4. Token attached to all subsequent API calls in `Authorization: Bearer <token>` header.
5. `JwtAuthenticationFilter` validates signature and populates `SecurityContextHolder`.

### RBAC Matrix

| Role Name | Scope | Key Permissions |
| :--- | :--- | :--- |
| **`ROLE_SUPER_ADMIN`** | Super Admin | Full administrative access, user provisioning, role mutation, account lock/unlock, feature flag toggles, job triggers, report downloads. |
| **`ROLE_WORKSPACE_ADMIN`**| Workspace Admin | View feature flags & cron jobs, view security audit logs, create projects. |
| **`ROLE_PM`** | Project Manager | Project creation/update, sprint planning, task assignment, task deletion (`DELETE /api/tasks/{id}`). |
| **`ROLE_SENIOR_ENG`** | Senior Engineer | Task creation/update, Kanban status drag, AI task decomposition. |
| **`ROLE_STAFF`** | Staff Contributor | Work item execution, subtask checklist, effort logging, comment posting. |
| **`ROLE_GUEST`** | Guest Observer | Read-only observation across executive dashboard, portfolio, and task backlog. |

---

## 🗄️ 7. Database & Flyway Schema

### Migration History
- **`V1__init.sql`**: Initializes core relational schema (`roles`, `users`, `projects`, `sprints`, `tasks`, `task_comments`, `time_entries`, `audit_logs`).
- **`V2__seed_data.sql`**: Inserts baseline enterprise seed records (Checksum `-1712630814` preserved).
- **`V3__fix_seed_password_hashes.sql`**: Updates seed user BCrypt password hashes to match `Password123!`.

---

## 🤖 8. Gemini AI Integration

PulseFlow integrates Google Gemini 3.6 Flash (`gemini-3.6-flash`) server-side in `GeminiAiService.java`:
- **Task Decomposition (`POST /api/ai/decompose`)**: Accepts task prose, returning structured subtasks with estimated hours.
- **Sprint Brief (`POST /api/ai/standup`)**: Analyzes active sprint telemetry to generate achievement lists and risk warnings.
- **Project Risk Audit (`POST /api/ai/risk-audit`)**: Evaluates portfolio health, outputting a numerical risk score and delay estimate.
- **Copilot Chat (`POST /api/ai/chat`)**: Context-aware interactive assistant answering queries on sprint velocity and task status.

---

## 💻 9. Local Development Setup

### Prerequisites
- Java 21 JDK (`java -version`)
- Node.js 20+ & npm (`node -v`)
- PostgreSQL 18 running on port 5432 (`pulseflow_db`)

### Environment Setup (`.env`)
Create a `.env` file in the project root (do not commit):
```env
VITE_API_URL=/api
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/pulseflow_db
SPRING_DATASOURCE_USERNAME=pulseflow_user
SPRING_DATASOURCE_PASSWORD=pulseflow_password
JWT_SECRET=your_dev_jwt_secret_key_at_least_256_bits_long
GEMINI_API_KEY=your_gemini_api_key
```

### Backend Launch
```bash
mvn clean spring-boot:run
```
Backend starts on `http://localhost:8080`.

### Frontend Launch
```bash
npm install
npm run dev
```
Frontend Vite dev server starts on `http://localhost:3000`.

---

## 🐳 10. Docker Architecture

The project uses a multi-stage `Dockerfile`:
1. **Stage 1 (Frontend Build)**: Compiles React 19 TypeScript source via Vite into `dist/`.
2. **Stage 2 (Backend Build)**: Packages Spring Boot 3.2 application into executable JAR (`pom.xml`).
3. **Stage 3 (Nginx Runtime)**: Embeds Java 21 JRE and Nginx into a single container. Nginx listens on port 10000, serving static SPA files and proxying `/api/*` and `/actuator/*` to Spring Boot on port 8080.

---

## 🧪 11. Verification & Test Suite Results

- **Backend Test Suite (`mvn test`)**: **24 / 24 Passed** (0 Failures, 0 Errors, 0 Skipped)
  - `SecurityRbacTest`: 14/14 passed
  - `AuthServiceTest`: 6/6 passed
  - `ProjectServiceTest`: 2/2 passed
  - `TaskServiceTest`: 2/2 passed
- **Frontend Type Check (`npm run lint` / `tsc --noEmit`)**: **0 Errors**
- **Vite Production Build (`npm run build`)**: **Success** (`dist/` generated)
- **Actuator Production Health**: `200 OK` (`status: UP`)
- **Flyway Migrations**: 3/3 validated successfully

---

## ⚠️ 12. Known Non-Blocking Limitations

1. **In-Memory Notification List**: System alerts in `NotificationController.java` are generated in controller memory.
2. **Task Delete UI Exposure**: The `DELETE /api/tasks/{id}` endpoint is functional and RBAC-guarded on backend, but not exposed via a button in the UI.
3. **Render Cold Start**: Idle free-tier Render containers take ~30–50s to cold-start.
4. **Gemini API Key Dependency**: AI features degrade gracefully if external API key is unconfigured.

---

## 🗺️ 13. Future Roadmap

- Persistent notifications database table (`V4__notifications_table.sql`).
- Expose Task Delete confirmation button in `TaskDetailModal.tsx`.
- Pagination support for task backlogs exceeding 100 items.
- Additional enterprise report export formats.

---

## 📁 14. Project Directory Structure

```text
pulseflow-enterprise/
├── src/
│   ├── main/
│   │   ├── java/com/pulseflow/
│   │   │   ├── config/          # Spring Security, JwtAuthenticationFilter, JwtTokenProvider
│   │   │   ├── controller/      # REST Controllers (Auth, Admin, Project, Task, AI, etc.)
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # JPA Entities (User, Project, Task, Sprint, etc.)
│   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   └── service/         # Business Logic & Gemini AI Services
│   │   └── resources/
│   │       ├── application.yml  # Spring Configuration
│   │       └── db/migration/    # Flyway Migrations (V1, V2, V3)
│   ├── test/java/com/pulseflow/ # JUnit 5 Security & Integration Tests
│   ├── components/              # React UI Views (Dashboard, Kanban, Tasks, Admin, AI)
│   ├── context/                 # AuthContext & ProjectContext Providers
│   ├── lib/                     # API Fetch Client (api.ts)
│   ├── types/                   # TypeScript Type Definitions
│   └── App.tsx                  # Root React Application
├── Dockerfile                   # Multi-stage Container Build Specification
├── entrypoint.sh                # Nginx & Spring Boot Dual Process Launcher
├── nginx.conf                   # Nginx Reverse Proxy Config
├── pom.xml                      # Maven Backend Dependencies
├── package.json                 # Frontend NPM Dependencies
├── tsconfig.json                # TypeScript Config
└── vite.config.ts               # Vite Bundler Config
```

---

## 💼 15. Portfolio Summary (For Recruiters)

The **PulseFlow Enterprise Platform** demonstrates full-stack software engineering capability across modern enterprise architecture:
- **Backend Core**: Java 21, Spring Boot 3, Spring Security 6, Spring Data JPA, Hibernate ORM, and Maven.
- **Frontend Architecture**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, and Context API state management.
- **Security & Authorization**: JWT authentication, BCrypt hashing, fine-grained RBAC with Spring `@PreAuthorize`, and 401/403 security handling.
- **Relational Data & Migrations**: PostgreSQL 18 with Flyway schema versioning and checksum validation.
- **Generative AI Integration**: Google Gemini 3.6 Flash server-side integration for task decomposition and risk telemetry.
- **DevOps & Cloud**: Docker multi-stage containerization, Nginx reverse proxying, and cloud deployment on Render.

---

## 📷 16. UI Screenshot Showcase Guide

1. **Login View (`/login`)**: Email/Password form, branded dark header, quick demo user selection buttons (`Sarah Connor`).
2. **Executive Overview Dashboard (`/dashboard`)**: 8 KPI cards (Active Projects, Sprint Progress, Tasks Completed, AI Risk Score), Recharts Bar & Pie graphs, AI Brief banner.
3. **Projects Portfolio (`/projects`)**: Project cards with key badges (`SEC`, `CLOUD`, `DATA`), logged vs budget progress bars, and risk tags.
4. **Agile Kanban Board (`/kanban`)**: 5 Kanban columns (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`) with task cards.
5. **Task Execution Console Modal (`/tasks`)**: Task title, priority badge, subtask checklist, effort logger, comment thread.
6. **Gemini AI Task Decomposition**: Auto-generated subtasks with estimated hours inside task detail modal.
7. **Interactive Stopwatch Time Tracker (`/time`)**: Live digital stopwatch widget, task picker, work note input, work log history table.
8. **Gemini AI Copilot Drawer**: Slide-out AI Copilot drawer with chat stream and preset prompt chips ("SPRINT BRIEFING", "RISK AUDIT").
9. **Admin Portal & RBAC Control (`/admin`)**: User provisioning table, role dropdowns (`Super Admin`, `PM`, `Senior Engineer`), feature flags, background job triggers.
10. **Security & Audit Logs (`/audit`)**: Immutable audit trail table and CSV export button.
