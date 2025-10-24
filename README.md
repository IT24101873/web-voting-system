# Notification & Email Reminder System

## 👤 Author  
**Name:** Liyanage J. L. K. L.  
**IT Number:** IT24101927  
**Module:** Notification & Email Reminder System  

---

## 📝 Overview  
This module is part of the **Web-based Voting System for Award Nominations**.  
It automates communication with students and staff by sending email notifications and reminders related to voting events.  

**Key responsibilities:**  
- Notify students about voting timelines and deadlines  
- Send scheduled or instant email reminders  
- Announce result releases  
- Provide an interface for admins to manage notification templates  
- Maintain a log of communication activity  

---

## 🎯 Features  
- Compose and send notifications  
- Support for **instant sending** or **scheduled delivery**  
- Email delivery via **SMTP (Gmail / Mailhog)**  
- Linked with student voting events  
- UI for composing and managing notifications  
- Error handling and scheduling updates  

---

## 🏗️ Workflow  
1. Admin logs in and accesses the Notification Dashboard.  
2. Admin composes a notification.  
3. Admin chooses to send **now** or **schedule** for later.  
4. System validates and queues the notification.  
5. Email is delivered to student recipients.  
6. All actions are logged for future reference.  

---

## 📂 Relevant File Structure  
```
src/
 └── main/java/com/example/votingsystem/notification/
      ├── api/NotificationController.java
      ├── model/Notification.java
      ├── repo/NotificationRepository.java
      └── service/NotificationService.java

frontend/
 └── src/pages/NotificationPage.jsx
```

---

## ⚙️ Tech Stack  
- **Backend:** Spring Boot (Java 17), Spring Data JPA  
- **Database:** H2 (Dev) / MySQL (Prod)  
- **Email:** Gmail SMTP / Mailhog (local testing)  
- **Frontend:** React (Vite, Tailwind, Shadcn UI)  

---

## 🚀 How to Run  

### Backend (Spring Boot)  
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```
Runs at: `http://localhost:8080`

### Frontend (React)  
```bash
cd Frontend
npm install
npm run dev
```
Runs at: `http://localhost:5173`

---

## 📧 Email Configuration  
Configure `application.yml` or `application.properties`:

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

> 🔑 Use an **App Password** when using Gmail.  
> 🛠 For local development, **Mailhog** is recommended.  

---

## 🔍 API Endpoints  

### Send Notification Now  
`POST /api/notifications/send`  
```json
{
  "recipient": "student@uni.lk",
  "subject": "Voting Reminder",
  "body": "Don’t forget to cast your vote today!"
}
```

### Schedule Notification  
`POST /api/notifications/schedule`  
```json
{
  "recipient": "student@uni.lk",
  "subject": "Voting Closing Soon",
  "body": "Voting will close at 6 PM today.",
  "sendAt": "2025-09-21T15:30:00"
}
```

### Fetch Notifications  
`GET /api/notifications`

---

## 👨‍💻 Contribution & Responsibilities  
This module was fully developed and maintained by **Liyanage J. L. K. L. (IT24101927)**.  

**My contributions include:**  
- Designing the **Notification & Email Reminder System** use case and activity flows.  
- Implementing **backend APIs** (`NotificationController`, `NotificationService`, `NotificationRepository`).  
- Creating the **Notification entity** with scheduling and logging support.  
- Integrating with **Spring Boot email service (SMTP)**.  
- Developing the **React-based Notification Page** for composing, sending, and scheduling notifications.  
- Testing with **H2 Database** and configuring Gmail/Mailhog integration.  
- Ensuring error handling, validation, and logging of communication events.  

---

## ✅ Current Status  
- Fully functional: supports **send now** and **schedule**.  
- Integrated with the voting system.  
- Tested with Gmail SMTP and H2 DB.  
- Ready for final demonstration.  

---
