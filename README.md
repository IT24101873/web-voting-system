# Award Categories & Nominee Management (Branch-Venuja)

## 👤 Author
**Name:** Ranasinghe R.P.V.K. *(Branch owner)*  
**IT Number:** IT24101829   
**Module:** Award Categories & Nominee Management

> Branch: **Branch-Venuja** · Group: **2025-Y2-S1-MLB-B8G1-02**

---

## 📝 Overview
This module manages **Event → Categories → Nominees** for the Voting System.  
Admins define categories per event and maintain nominee lists with bios/photos. Students read these during voting.

**Responsibilities:**
- CRUD for **Categories** (per event)
- CRUD for **Nominees** (per category)
- Input validation (required fields, uniqueness per event)
- Status-aware writes (e.g., prevent edits after event closes)
- Lightweight search/filter by event/category

---

## 📂 Branch Structure (top levels)
```
web-voting-system-Branch-Venuja/
  web-voting-system-Branch-Venuja/
  web-voting-system-Branch-Venuja/
    .idea/
    .mvn/
    Nominee-frontend/
    src/
    .gitattributes
    .gitignore
    mvnw
    mvnw.cmd
    pom.xml
    .idea/
      .gitignore
      compiler.xml
      copilot.data.migration.agent.xml
      copilot.data.migration.ask.xml
      copilot.data.migration.ask2agent.xml
      copilot.data.migration.edit.xml
      dataSources.xml
      encodings.xml
      jarRepositories.xml
      misc.xml
      modules.xml
    .mvn/
    Nominee-frontend/
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
- **Spring Boot 3.x**, **Spring Data JPA**, **Validation**
- **H2 (Dev)** / **MySQL (Prod)**
- **React (module frontend, if present)**

---

## 🔍 API Endpoints (detected)
(See the interactive table above for exact paths/methods/roles.)

**Typical routes (adjust to your code):**
- **Categories**
  - `GET    /api/categories?eventId=<id>` – list categories for event
  - `POST   /api/categories` – create category
  - `PUT    /api/categories/<built-in function id>` – update category
  - `DELETE /api/categories/<built-in function id>` – delete category
- **Nominees**
  - `GET    /api/nominees?categoryId=<id>` – list nominees for category
  - `POST   /api/nominees` – create nominee
  - `PUT    /api/nominees/<built-in function id>` – update nominee
  - `DELETE /api/nominees/<built-in function id>` – delete nominee

---

## 🗃️ Data Model (simplified)
```
Event(id, name, start_at, end_at, status)

Category(
  id, event_id, name, description, created_at, updated_at
)

Nominee(
  id, category_id, name, bio, photo_url, created_at, updated_at
)
```
- **Uniqueness**: `(event_id, category.name)` should be unique per event.
- **Cascade**: deleting a category should handle nominee rows (soft/hard delete policy).

---

## ✅ Validation & Rules
- Category: `name` required (3–80 chars), description optional (≤ 500 chars)
- Nominee: `name` required (3–80), `bio` optional (≤ 1000), `photo_url` optional
- Event status: **no edits** after event is CLOSED (enforce in service layer)
- Prevent deletion if votes exist (or require admin override + audit log)

---

## 🔐 Access Control
- Endpoints typically **ADMIN-only** via `@PreAuthorize("hasRole('ADMIN')")`
- Read-only lists may be public or student-accessible during voting

---

## 🧪 Testing Tips
- Seed an event with 2–3 categories and 3+ nominees each
- Verify uniqueness constraints and deletion rules
- Ensure event status blocks edits when CLOSED

---

## 🛠 Troubleshooting
- **400/422**: validation failure (bad names, missing IDs)
- **409**: uniqueness conflict (duplicate category within the event)
- **403**: missing/insufficient role
- **Delete blocked**: existing votes for that category/nominee

---
