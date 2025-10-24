# Web-based Voting System Dashboard 

## 👤 Author
**Name:** Fernando W.P.S. *(Branch owner)*  
**IT Number:** IT24103815  
**Module:** Web-based Voting System Dashboard

> Branch: **Branch-Paboda** · Group: **2025-Y2-S1-MLB-B8G1-02**

---

## 📝 Overview
This branch contains module-specific work as part of the **Web-based Voting System for Award Nominations**.  
It includes a Spring Boot backend (under `src/`) and may include a dedicated frontend if present.

**Responsibilities (typical):**
- Manage domain entities relevant to this module (e.g., events, categories, nominees, students, votes)
- Provide REST APIs secured with Spring Security
- Support admin operations and student-facing features
- Integrate with the overall system (auth, dashboard, notifications)

---

## 📂 Branch Structure (top levels)
```
web-voting-system-Branch-Paboda/
  web-voting-system-Branch-Paboda/
  web-voting-system-Branch-Paboda/
    .mvn/
    dashboard-frontend/
    src/
    .gitattributes
    .gitignore
    mvnw
    mvnw.cmd
    pom.xml
    .mvn/
    dashboard-frontend/
      .env
      .gitignore
      README.md
      eslint.config.js
      index.html
      package-lock.json
      package.json
      vite.config.js
    src/
```

---

## 🧰 Tech Stack
- **Backend:** Java 17, Spring Boot 3.x (Web, Data JPA, Security, Validation)
- **Database:** H2 (Dev) / MySQL (Prod)
- **Frontend:** (If present) React (Vite)

---

## ⚙️ Configuration

### Backend (H2 Dev) – `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:h2:mem:moduledb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# CORS for local frontend
app.cors.allowed-origins=http://localhost:5173
```

### Backend (MySQL Prod/QA)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/moduledb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

---

## 🚀 How to Run

### Backend
```bash
mvn clean install
mvn spring-boot:run   # http://localhost:8080
```

### Frontend (if present)
```bash
cd <module-frontend-dir>
npm install
npm run dev           # http://localhost:5173
```

---

## 🔍 API Endpoints (auto-detected)
(Endpoints table shown in the interactive view above if any were detected.)

---

## 🗃️ Data Model (typical)
```
Event(id, name, start_at, end_at, status)
Category(id, event_id, name, description)
Nominee(id, category_id, name, bio, photo_url)
Student(id, email, full_name, index_no, eligible, role)
Vote(id, student_id, category_id, nominee_id, created_at)  // unique (student,category)
```
(Add or remove entities according to this branch’s focus.)

---

## 🛠 Troubleshooting
- **403 Forbidden:** check token/roles and CORS
- **CORS errors:** align frontend origin with backend allowed origins
- **H2 console:** enable and visit `/h2-console`
- **DB schema:** set `ddl-auto` appropriately for dev vs prod

---

## 👨‍💻 Contribution
- Branch naming: `feature/<area>`, `fix/<issue>`
- PRs go into `dev` → reviewed → merged into `main`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---
