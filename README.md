# Access Control & Password Management (Branch-Upeksha)

## 👤 Author 
**Name:** Senevirathna U.K.J. *(Branch owner)*  
**IT Number:** IT24101952   
**Module:** Access Control & Password Management  

> Branch: **Branch-Upeksha** · Group: **2025-Y2-S1-MLB-B8G1-02**

---

## 📝 Overview
Implements **authentication**, **authorization**, and **password management**:
secure login with JWT, role-based access, password hashing with BCrypt, and flows for change/reset.

---

## 🎯 Features
- **JWT Authentication**: login issues a token; clients send `Authorization: Bearer <token>`
- **Role Guards**: `@PreAuthorize("hasRole('ADMIN')")`, etc. for protected endpoints
- **Password Hashing**: store **BCrypt** hashes only
- **Change Password**: verify current password → update to new strong password
- **Forgot/Reset**: email a short-lived token; set new password using the token
- **User/Role Admin**: (if included) admin CRUD for accounts and role assignment
- **CORS/CSRF**: SPA-friendly; stateless, CSRF disabled, CORS allowlist for the frontend

---

## 🗺️ Endpoints (detected)
(See the interactive table above for exact paths/methods/roles.)

**Typical paths (adjust to code):**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `PUT  /api/auth/password`          # change password (current + new)
- `POST /api/auth/forgot`            # request reset token by email
- `POST /api/auth/reset`             # set new password using token
- `GET  /api/users/me`
- `GET  /api/users`                  # admin
- `POST /api/users`                  # admin
- `PUT  /api/users/{id}`             # admin
- `DELETE /api/users/{id}`           # admin

---

## 🔁 Flows

### Login
1) Client → `POST /api/auth/login` with `{ "email", "password" }`  
2) API → validates & returns `{ "token", "role" }`

### Change Password
1) Auth user → `PUT /api/auth/password` with `{ "currentPassword", "newPassword" }`  
2) API → `BCrypt.matches(currentPassword, hash)` then save new BCrypt hash

### Forgot/Reset Password
1) User → `POST /api/auth/forgot` with `{ "email" }`  
2) API → create **reset token** (expires, one-time) and send email link  
3) User → `POST /api/auth/reset` with `{ "token", "newPassword" }`  
4) API → validate token & expiry, save new **BCrypt** hash, invalidate token

---

## 🗃️ Data Model (simplified)
```
User(id, email, passwordHash, fullName, role, enabled, createdAt)
PasswordResetToken(id, userId, token, expiresAt, used)
```
- Passwords are **never** stored in plain text.
- `expiresAt` should be UTC; typical TTL: 15–30 minutes.

---

## ⚙️ Security Config (typical)
- Stateless JWT via `SecurityFilterChain`
- Public: `/api/auth/login`, `/api/auth/forgot`, `/api/auth/reset`
- Protected: other `/api/**` routes (`authenticated()` + role checks)
- CORS allowlist: `http://localhost:5173` for dev (Vite)
- CSRF disabled (stateless APIs)

---

## 🧪 Validation & Policy
- Minimum length (≥8), require letters + digits (and symbols if desired)
- Optional: password history, account lockout & rate-limits
- Always compare using `BCrypt`

---

## 🛠 Troubleshooting
- **403**: missing/expired token or wrong role
- **Reset email not received**: verify SMTP or use MailHog locally
- **Password not changing**: wrong current password or weak new password
- **CORS error**: update backend allowed origins

---
