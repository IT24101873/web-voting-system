# Web-based Voting System for Award Nominations

## 📌 Project Overview  
This system is developed as part of the **SE2030 – Software Engineering** group assignment (Year 2, Semester 1).  
It is a **Java-based web application** that allows final-year students to participate in award voting events while ensuring fairness, transparency, and automation.  

The system follows **Agile principles**, applies **SDLC stages**, and uses **UML modeling** (Use Case & Activity Diagrams).  
Each group member was responsible for a **major function** of the system.  

---

## 👥 Group Members & Responsibilities  

| IT Number   | Name                | Major Function                          |
|-------------|---------------------|-----------------------------------------|
| IT24101873  | Jesmeen M.B.A       | Voting Management                       |
| IT24101829  | Ranasinghe R.P.V.K. | Award Categories & Nominee Management   |
| IT24101927  | Liyanage J. L. K. L.| Notification & Email Reminder System    |
| IT24103815  | Fernando W.P.S.     | Voting Progress Dashboard               |
| IT24101972  | Nethsara K.P.S      | Results & Report Management             |
| IT24101952  | Senevirathna U.K.J. | Access Control & Password Management    |

---

## 📝 Core Functions  

### 1. Voting Management (Jesmeen M.B.A)  
- Cast a vote (one per category)  
- Prevent duplicate voting  
- Review and confirm selections  
- Enforce voting deadlines  

### 2. Award Categories & Nominee Management (Ranasinghe R.P.V.K.)  
- Create/update award categories  
- Add/edit/delete nominees  
- Upload nominee bios & photos  
- Control voting start/end times  

### 3. Notification & Email Reminder System (Liyanage J. L. K. L.)  
- Send automated email reminders  
- Notify students of deadlines & results  
- Manage notification templates  
- Log all communication  

### 4. Voting Progress Dashboard (Fernando W.P.S.)  
- Display real-time voting statistics  
- Track participation & irregularities  
- Provide filters by category  
- Export progress reports  

### 5. Results & Report Management (Nethsara K.P.S.)  
- Generate final results  
- Publish winners after voting ends  
- Archive past results  
- Export reports  

### 6. Access Control & Password Management (Senevirathna U.K.J.)  
- Role-based access (Admin, Organizer, Student, IT Staff)  
- Secure login and password reset  
- Account lock after multiple failed logins  
- Restrict access to eligible users  

---

## 🏗️ System Architecture & Workflow  

1. **Login & Access Control** → Role-based access granted.  
2. **Voting Process** → Students cast votes securely.  
3. **Nominee Management** → Admin manages categories & nominees.  
4. **Notification System** → Students reminded about deadlines/results.  
5. **Dashboard Monitoring** → Organizers track real-time progress.  
6. **Result Publishing** → Final reports generated & winners announced.  

---

## ⚙️ Tech Stack  
- **Backend:** Spring Boot (Java 17), Spring Data JPA  
- **Frontend:** React (Vite, Tailwind, Shadcn UI)  
- **Database:** H2 (Dev) / MySQL (Prod)  
- **Email Service:** Gmail SMTP / Mailhog (for local testing)  
