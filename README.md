# Web‑based Voting System for Award Nominations
_Group: 2025‑Y2‑S1‑MLB‑B8G1‑02_

A full‑stack application for managing university award events, nominees, and secure student voting with real‑time progress and final results.

---

## ✨ Features

- **Authentication & Access Control**: Login, logout, password reset; roles: `ADMIN`, `EVENT_ORGANIZER`, `STUDENT`.
- **Award Categories & Nominee Management**: CRUD for categories and nominees; duplicate and integrity validation.
- **Voting Management**: One vote per category per eligible student; review screen; final submit locks ballot.
- **Progress Dashboard**: Live KPIs and category‑wise progress for admins/organizers.
- **Results & Reports**: Winner computation, PDF/CSV export, publish winners page.
- **Notifications**: Compose & schedule email reminders (start day, mid‑window, last‑day).

---

## 🏗 Tech Stack

**Backend**: Java 17 · Spring Boot 3 · Spring Web · Spring Data JPA (Hibernate) · Validation · Security · Mail · H2 (dev) / MySQL (prod) · Maven  
**Frontend**: React + Vite · (TypeScript optional) · Fetch/Axios · Tailwind (optional)  
**Dev Tools**: Node 18+ · npm · Git · IntelliJ IDEA/VS Code · Postman

---

## 📁 Repository Structure

```
/voting-system/
  backend/
    src/main/java/com/example/votingsystem/...
    src/main/resources/
      application.yml
      data.sql                 # optional dev seed
    pom.xml
  voting-frontend/
    src/
    index.html
    package.json
README.md
```

> If your folders differ, update paths accordingly.

---

## ⚙️ Backend Setup (Spring Boot)

### 1) Prerequisites
- Java 17, Maven 3.9+
- Optional: MySQL 8.x (for production use)

### 2) Configuration — H2 (Dev)
Create/confirm `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:votingdb;DB_CLOSE_DELAY=-1;MODE=MySQL
    driverClassName: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate.format_sql: true
  h2:
    console:
      enabled: true
      path: /h2
server:
  port: 8080

app:
  voting:
    allowSkipCategories: true
    lockOnSubmit: true
```

### 3) Configuration — MySQL (Prod)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/votingdb?useSSL=false&serverTimezone=UTC
    username: root
    password: <your-password>
  jpa:
    hibernate:
      ddl-auto: update
```

### 4) (Optional) Email (Gmail SMTP)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: <app-password>
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

### 5) Build & Run
```bash
cd backend
mvn clean spring-boot:run
# -> http://localhost:8080
```

---

## 🖥 Frontend Setup (Vite + React)

### 1) Create/Install
```bash
# from repo root (if not created yet)
npm create vite@latest voting-frontend -- --template react
cd voting-frontend
npm install
```

### 2) Environment
Create `.env` inside `voting-frontend/`:
```
VITE_API_BASE=http://localhost:8080/api
```

### 3) Start Dev Server
```bash
npm run dev
# -> http://localhost:5173
```

### 4) Minimal API Helper (`src/lib/api.ts`)
```ts
export const api = (path: string, init?: RequestInit) =>
  fetch(\`\${import.meta.env.VITE_API_BASE}\${path}\`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });
```

---

## 🔐 Roles & Access

- `ADMIN` – full access to system configs, reports, and dashboards.
- `EVENT_ORGANIZER` – manage events, categories, nominees, see progress.
- `STUDENT` – view ballot and submit votes (eligible final‑year students only).

---

## 📚 Example Endpoints (REST)

```
# Auth
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Categories & Nominees
GET    /api/categories
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}

GET    /api/categories/{id}/nominees
POST   /api/categories/{id}/nominees
PUT    /api/nominees/{id}
DELETE /api/nominees/{id}

# Voting
GET    /api/events/{eventId}/ballot
POST   /api/events/{eventId}/vote           # { categoryId, nomineeId }
POST   /api/events/{eventId}/submit         # locks the ballot

# Dashboard & Reports
GET    /api/dashboard/overview
GET    /api/dashboard/category/{categoryId}
POST   /api/reports/generate
GET    /api/reports/{reportId}/download
```

---

## 🧪 Seeding (Dev)

`backend/src/main/resources/data.sql` (example):
```sql
-- Categories
insert into categories(id, name) values
  (1, 'Best Innovator'),
  (2, 'Best Team Player');

-- Nominees
insert into nominees(id, category_id, full_name) values
  (101, 1, 'Akeel Nizam'),
  (102, 1, 'Bimali Perera'),
  (103, 2, 'Chanuka Silva'),
  (104, 2, 'Dewmini Jayasuriya');

-- Students (eligible)
insert into students(id, email, full_name, final_year) values
  (10001, 's10001@uni.test', 'Akeel Nizam', true),
  (10002, 's10002@uni.test', 'Bimali Perera', true);
```

---

## 🔒 Security Rules

- Passwords hashed with BCrypt.
- Session/JWT authentication (choose one and configure).
- **Vote locking** after final submission; attempts after deadline are denied.
- Role‑based access to admin/organizer routes.
- H2 console enabled only for dev.

---

## 📊 Results & Reports

- Winner = nominee with max votes per category (tie‑break configurable).
- Export **CSV/PDF** reports for archive and publishing.
- Public winners page after voting window ends.

---

## 🧰 Common Scripts

```bash
# Backend
mvn -q test
mvn -q package

# Frontend
npm run dev
npm run build
npm run preview
```

---

## 🤝 Contributing

1. Create a feature branch from `dev` (e.g., `feature/uc-02-nominee-crud`).
2. Commit with scope and use‑case ID (e.g., `UC‑02: prevent duplicate nominee`).
3. Open a PR → Code review → Merge to `dev` → Release to `main`.

---

## 🗺 Roadmap

- 2FA for admins
- Enhanced audit logs
- Push notifications
- Docker Compose for one‑command setup
- CI (GitHub Actions)

---

## 📄 License

Academic coursework project; for internal educational use.

---

## 🧭 Quick Start (Full Stack)

```bash
# terminal 1
cd backend && mvn spring-boot:run

# terminal 2
cd voting-frontend && npm install && npm run dev
```
