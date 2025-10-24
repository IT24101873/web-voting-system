# Notification & Email Reminder System

## 👤 Author  
**Name:** Liyanage J. L. K. L. *(Branch owner)*
**IT Number:** IT24101927
**Module:** Notification & Email Reminder System 

**Name:** Jesmeen M. B. A. *(Branch owner)*  
**IT Number:** IT24101873  
**Module:** Full-stack Repo – Web-based Voting System for Award Nominations

> Branch: **Branch-Kavisha** · Group: **2025-Y2-S1-MLB-B8G1-02**

---

## 📝 Overview  
This module automates communication with students and staff for the **Web-based Voting System for Award Nominations**.  
Admins can compose, send, and schedule email notifications tied to voting events and deadlines.

**Key responsibilities:**  
- Inform students about event start/end times and important deadlines  
- Send **instant** or **scheduled** email reminders  
- Announce result releases  
- Provide an admin UI to manage notification templates and history  
- Maintain logs for delivery status and auditing

---

## 🎯 Features  
- Create, edit, and send notifications  
- Schedule delivery at a specific date/time (queue + status)  
- SMTP-based email delivery (Gmail / MailHog)  
- Linked to events and student lists  
- Basic analytics: sent vs scheduled, recent activity  
- Robust error handling & retries (where configured)

---

## 📂 Module Structure (from this branch)
```
web-voting-system-Branch-Kavisha/
  web-voting-system-Branch-Kavisha/
    .mvn/
    src/                         # Spring Boot backend (notification APIs)
    Notification-frontend/       # React (Vite) frontend for this module
      .env
      index.html
      package.json
      vite.config.js
    pom.xml
```
> Detected **6 REST endpoints** in 1 controller file during auto-scan. If you want, we can embed the exact list here.

---

## 🧰 Tech Stack  
- **Backend:** Java 17, Spring Boot 3.x (Web, Data JPA, Validation, Mail)  
- **Database:** H2 (Dev) / MySQL (Prod)  
- **Email:** Gmail SMTP (prod/dev) or **MailHog** (local testing)  
- **Frontend:** React (Vite), React Router, (Tailwind / CSS)

---

## ⚙️ Configuration

### Backend (H2 Dev) – `src/main/resources/application.properties`
```properties
spring.datasource.url=jdbc:h2:mem:notifydb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true

# CORS: adjust to frontend dev origin
app.cors.allowed-origins=http://localhost:5173
```

### Backend (MySQL Prod/QA)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/notifydb?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### Email (SMTP)
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
> 🔑 Use an **App Password** for Gmail.  
> 🛠 For local development, **MailHog** is recommended.

### Frontend – `Notification-frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 How to Run

### Backend (Notification APIs)
```bash
# from repo root
mvn clean install
mvn spring-boot:run         # serves at http://localhost:8080
```

### Frontend (Notification UI)
```bash
cd Notification-frontend
npm install
npm run dev                 # http://localhost:5173
```

---

## 🔍 API Endpoints (typical)
> Replace with your exact paths if they differ.

- `GET  /api/notifications` – List notifications (paged)  
- `POST /api/notifications` – Create notification (send now or schedule)  
- `PUT  /api/notifications/{id}` – Update notification (if not sent)  
- `DELETE /api/notifications/{id}` – Archive/remove  
- `POST /api/notifications/send` – Trigger immediate send  
- `POST /api/notifications/schedule` – Schedule for later

**Roles/Access**  
- Admin endpoints typically require `hasRole('ADMIN')` (adjust per your controller).

---

## 🗃️ Data Model (simplified)
```
Notification(
  id, title, body, status, scheduledFor, createdAt, archived, recipients...
)
```
- `status`: e.g., QUEUED, SENDING, SENT, FAILED  
- `scheduledFor`: Instant (UTC) for delayed delivery  
- Keep an audit log for sent emails and errors

---

## 🧪 Dev Notes
- Enable H2 console: `spring.h2.console.enabled=true` then visit `/h2-console`  
- CORS: make sure frontend origin matches `app.cors.allowed-origins`  
- Timezone: store timestamps in UTC; convert on UI if needed  
- Retry/requeue policy can be added for resilience

---

## 🛠 Troubleshooting
- **403 Forbidden**: verify token + role; configure CORS correctly  
- **Emails not sending**: wrong SMTP creds or blocked app password  
- **Scheduler not firing**: check cron config & application logs  
- **CORS errors**: mismatch between frontend origin and backend CORS config

---

## 👨‍💻 Contributions (Branch-Kavisha)
- Notification UI (React Vite) in `Notification-frontend/`  
- Backend controller/service/repo for notifications under `src/`  
- Integration with voting event timeline and student recipients  
- Tested with H2 and Gmail/MailHog

---

## ✅ Status
- Module scaffold present (backend + Notification-frontend)  
- Endpoints detected and ready for integration/testing

---
