# Web-based Voting System (Full Repository)

## 👤 Author  
**Name:** Jesmeen M. B. A. *(Branch owner)*  
**IT Number:** IT24101873  
**Module:** Full-stack Repo – Web-based Voting System for Award Nominations  

> Branch: **Branch-Jesmeen** · Group: **2025-Y2-S1-MLB-B8G1-02**

---

## 📝 Overview  
This repository contains the **full application** for conducting award nominations and voting at the campus.  
It includes the **Spring Boot backend** and the **React (Vite) frontend** located under `voting-frontend/`.

**Core responsibilities of this repo:**  
- Manage events, categories, nominees, and eligible voters  
- Enforce one-vote-per-category per student with secure authentication/authorization  
- Provide admin dashboards (KPIs + category progress)  
- Send notifications (instant or scheduled) and track delivery status  
- Publish results and export reports  

---

## 🎯 Features  
- **Role-based access**: `ADMIN`, `ORGANIZER`, `STUDENT` (Spring Security)  
- **Voting engine**: One vote per category; review & submit workflow  
- **Event lifecycle**: draft → open → closed → results published  
- **Notifications**: queue, schedule, and send email reminders  
- **Dashboards**: KPIs, per-category participation, time-series activity  
- **Backups**: dev H2 support and prod MySQL-ready  
- **Responsive UI**: modern, mobile-friendly frontend

---

## 🏗️ High-level Workflow  
1. Admin creates an **Event** and **Categories** with **Nominees**  
2. Students sign in → see active event → select nominees per category  
3. Student **reviews** votes → **submits** (lock for event)  
4. Admin monitors progress via **Dashboard**  
5. Notifications remind students and announce results  
6. Admin **publishes results** and exports reports

---

## 📂 Repository Structure  
```
web-voting-system-Branch-Jesmeen/
  └─ web-voting-system-Branch-Jesmeen/         # Root project
      ├─ .mvn/                                  # Maven wrapper files
      ├─ src/                                   # Spring Boot backend (Java)
      ├─ voting-frontend/                       # React (Vite) frontend
      │   ├─ .env
      │   ├─ README.md
      │   ├─ eslint.config.js
      │   ├─ index.html
      │   ├─ package.json
      │   └─ vite.config.js
      ├─ mvnw, mvnw.cmd                         # Maven wrapper scripts
      ├─ pom.xml                                # Backend build descriptor
      ├─ .gitignore, .gitattributes
      └─ README.md (this file)
```

> Note: Only top-level files/folders are shown here. Backend packages include: `auth`, `vote`, `category`, `nominee`, `notification`, `dashboard`, etc. (adjust as per your codebase).

---

## 🧰 Tech Stack  
- **Backend:** Java 17, Spring Boot 3.x (Web, Data JPA, Security, Validation)  
- **Database:** H2 (Dev) / MySQL 8+ (Prod)  
- **Frontend:** React (Vite), React Router  
- **Build:** Maven, npm  
- **Email:** SMTP (Gmail/MailHog) for notifications

---

## ⚙️ Configuration

### Backend (H2 Dev) – `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:h2:mem:votingdb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# CORS: Adjust to frontend dev port
app.cors.allowed-origins=http://localhost:5173
```

### Backend (MySQL Prod/QA)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/votingdb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### Email (optional – for notifications)
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

> For Gmail, use an **App Password**. For local testing, consider **MailHog**.

### Frontend – `voting-frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 How to Run

### Backend
```bash
# from repo root
mvn -v                  # ensure Maven is available
mvn clean install
mvn spring-boot:run     # runs API at http://localhost:8080
```

### Frontend
```bash
cd voting-frontend
npm install
npm run dev             # opens http://localhost:5173
```

---

## 🔐 Roles & Access (Quick Notes)
- Endpoints can be guarded via `@PreAuthorize("hasRole('ADMIN')")` (admin-only) or allowed for students.  
- **Common 403** reasons: missing token, role mismatch, or CORS misconfig.

---

## 🗃️ Data Model (Simplified)
```
Event(id, name, start_at, end_at, status)
Category(id, event_id, name, description)
Nominee(id, category_id, name, bio, photo_url)
Student(id, email, full_name, index_no, eligible, role)
Vote(id, student_id, category_id, nominee_id, created_at)  // unique (student,category)
Notification(id, title, body, status, scheduled_for, created_at, archived)
```

---

## 🔍 API Endpoints (Examples)
> Adjust paths to match your controllers. Typical routes include:

### Auth
- `POST /api/auth/login` → `{ email, password }` → `{ token, role }`

### Voting
- `GET  /api/events/current` – Active event with categories & nominees  
- `POST /api/votes` – Cast/replace vote for a category  
- `GET  /api/votes/me` – Preview my selections  
- `POST /api/votes/submit` – Finalize my votes for the event

### Admin – Dashboard
- `GET  /api/dashboard/kpis` – Top-level metrics  
- `GET  /api/dashboard/categories` – Per-category progress

### Notifications
- `GET  /api/notifications` – List notifications  
- `POST /api/notifications` – Create (send now or schedule)

### Results
- `POST /api/results/generate?eventId=...` – Compute winners  
- `GET  /api/results/published?eventId=...` – Public results

---

## 🧪 Dev Seeding (Optional)
If you enable a data seeder (e.g., `app.seed=true`), include dev users like:  
- **Admin:** `admin@campus.edu` / `Admin@123`  
- **Student:** `s100001@campus.edu` / `Student@123`

---

## 🛠 Troubleshooting
- **403 Forbidden:** token not sent, incorrect role, or CORS not allowed  
- **CORS:** set `app.cors.allowed-origins` to `http://localhost:5173` for dev  
- **H2 Console:** `spring.h2.console.enabled=true`, then visit `/h2-console`  
- **Duplicate votes:** enforce unique `(student_id, category_id)` and service check  
- **Email not sending:** verify SMTP credentials/timezone

---

## 👨‍💻 Contribution & Branching
- Branches: `feature/<area>`, `fix/<issue>` → PRs into `dev` → merge to `main`  
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---

## ✅ Current Status
- Backend + Frontend structure present (`src/`, `voting-frontend/`)  
- Ready to configure DB, email, and run locally for demo

---
