# Web-based Voting System for Award Nominations
**Group:** 2025-Y2-S1-MLB-B8G1-02

## 🚀 Overview
A secure, web-based e-voting platform for campus award nominations. Final-year students vote once per category, admins manage events/categories/nominees, and organizers publish results with transparent reports and dashboards.

## 🎯 Core Goals
- Online voting with **one vote per category per student**
- Admin tools to **create categories**, **manage nominees**, **monitor progress**
- **Results generation** with exports and public publishing
- **Access control** with password management and reset flows

## 👥 Stakeholders / Users
- Final-Year Students (Voters)
- Admin Staff
- Event Organizers / Supervisors
- IT Support
- Public viewers (nominees & winners only)

## 🧩 Major Modules (RACI by owner)
- **Voting Management** – IT24101873 (Jesmeen M.B.A)
- **Award Categories & Nominee Management** – IT24101829 (Ranasinghe R.P.V.K.)
- **Notification & Email Reminder System** – IT24101927 (Liyanage J.L.K.L.)
- **Voting Progress Dashboard** – IT24103815 (Fernando W.P.S.)
- **Results & Report Management** – IT24101972 (Nethsara K.P.S.)
- **Access Control & Password Management** – IT24101952 (Senevirathna U.K.J.)

## ✅ Key Features
- Secure login (students/admins), role-based access, password reset
- Admin CRUD for categories & nominees (with validation)
- One-vote-per-category enforcement, review before submit
- Live dashboard (category/nominee progress, KPIs)
- Result computation, tie handling, CSV/PDF exports, public results page
- Email reminders (before close) and result notifications

## 🏗️ Architecture (Typical Monorepo)
```
/voting-backend/         # Spring Boot (Java 17, Maven, H2 for dev/test)
/voting-frontend/        # React (Vite) SPA
```
**Tech stack:** Java 17, Spring Boot, Spring Data JPA, H2 (dev), MySQL (prod-ready), React (Vite), JavaMail (or provider API), BCrypt.

## 🗃️ Data Model (high-level)
- **User**(id, itNumber/email, role[STUDENT, ADMIN, ORGANIZER], passwordHash, status)
- **Event**(id, name, startAt, endAt, status)
- **Category**(id, eventId, name, status)
- **Nominee**(id, categoryId, name, bio, photoUrl, status)
- **Vote**(id, voterId, categoryId, nomineeId, createdAt) — unique(voterId, categoryId)
- **Notification**(id, subject, body, scheduledFor, status, archived)  
*(Enforces one vote per student per category; use soft delete where needed.)*

## 🔐 Security
- BCrypt password hashing
- Role-based authorization (Student/Admin/Organizer)
- Session management and account lockout on repeated failures
- Password reset via email token

## 📈 Non-Functional Requirements
- Mobile-friendly, accessible UI
- Target ≤2s response for typical actions; scale to hundreds of concurrent voters
- 99% uptime during voting windows; regular backups
- HTTPS in deployment; audit logs for admin actions

## ⚙️ Getting Started

### Prerequisites
- Java 17, Maven 3.9+
- Node.js 18+ and npm (or pnpm/yarn)
- IDEs: IntelliJ IDEA (backend), VS Code/WebStorm (frontend)

### 1) Backend (Spring Boot + H2)
```bash
cd voting-backend
cp src/main/resources/application.example.properties src/main/resources/application.properties
# Edit DB/email if needed (defaults use H2)
mvn spring-boot:run
```

**Default dev config (H2):**
```properties
spring.datasource.url=jdbc:h2:mem:votingdb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.username=sa
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# Mail (optional for dev)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_app_email
spring.mail.password=your_app_password_or_app_password
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 2) Frontend (React + Vite)
```bash
cd ../voting-frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```
Set backend API base URL in an env (e.g., `VITE_API_BASE=http://localhost:8080/api`).

### 3) Login & Roles (seed)
- Create an **ADMIN** account first (via DB insert or signup + role patch).
- Add **categories/nominees**, then test **student** voting flow.

## 🧪 Sample API (illustrative)
- `POST /api/auth/login` – authenticate user
- `GET /api/categories` – list categories (+ nominees)
- `POST /api/votes/submit` – submit all category votes (one-shot)
- `GET /api/dashboard` – admin KPIs & charts
- `POST /api/results/generate` – compute winners & export
- `POST /api/notifications/send` – send reminders/results  
*(Implement with DTOs; enforce `unique(voterId, categoryId)` at DB + service layer.)*

## 📤 Reports & Publishing
- Admin can **generate results**, **review**, **export CSV/PDF**, and **publish** to a public page after voting closes.  
- Tie rules and freeze flags recommended.

## 🔔 Notifications
- Compose reminders; **schedule** (e.g., T-48h, T-24h) or **send now**  
- Store send logs; add retry/backoff in production.

## 📊 Dashboard
- Live progress (total votes, turnout, per-category counts)
- Lightweight polling (e.g., 10s) or SSE/WebSocket upgrade later
- Optional CSV/PDF export of progress snapshots

## 🧭 Project Management (Semester Flow)
- **Week 3:** Proposal & requirements
- **Weeks 4–6:** Design (ERD, use cases, UI)
- **Weeks 7–11:** Implementation (≥75% by Week 10)
- **Weeks 12–13:** Testing & optimization
- **Week 14:** Final demo + report submission

## 👪 Team & Responsibilities
- Jesmeen (IT24101873): Voting Management
- Ranasinghe (IT24101829): Categories & Nominees
- Liyanage (IT24101927): Notifications
- Fernando (IT24103815): Dashboard
- Nethsara (IT24101972): Results & Reports
- Senevirathna (IT24101952): Access Control & Passwords

## 🧭 How to Demo
1. Login as **Admin**, create categories & nominees  
2. Create a **Student** account and login  
3. Cast votes (one per category) → submit → confirmation  
4. As **Admin**, open **Dashboard** (live counts)  
5. Close voting → **Generate results** → export CSV/PDF → **Publish** public page  
6. Send **result emails** to voters

## 🔮 Future Enhancements
- Native mobile app (push notifications)
- Blockchain-backed vote audit trail
- i18n (Sinhala/Tamil)
- ML-based turnout predictions & anomaly detection
- Microservices & containerization for scale
****
