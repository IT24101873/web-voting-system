# Results & Report Management

## 👤 Author  
**Name:** Nethsara K.P.S *(Branch owner)*  
**IT Number:** IT24101972  
**Module:** Results & Report Management 

> Branch: **Branch-Sandaru** · Group: **2025-Y2-S1-MLB-B8G1-02**

This module handles **winner calculation, publication, and report exports** for the voting system.
It includes admin-only APIs to compute winners per category, publish results, and export CSV/PDF-ready summaries.

## 🔐 Access & Roles
- Typically **ADMIN-only** endpoints via `@PreAuthorize("hasRole('ADMIN')")`.
- Public endpoints (if any) expose **published** results only.

## 🔁 Workflow
1. **Generate results** for an event (aggregate votes per category).
2. **Review** generated winners/summaries in the admin UI.
3. **Publish** results to make them visible to students/public.
4. **Export** reports (CSV/PDF-ready) for archiving or sharing.

## 🗺️ API Endpoints (detected)
- **GET /api/admin/reports**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/EventReportController.java — _hasRole('ADMIN')_)
- **GET /api/admin/reports**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/EventReportController.java — _hasRole('ADMIN')_)
- **GET /api/admin/reports/events**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/EventReportController.java — _hasRole('ADMIN')_)
- **GET /api/admin/reports/events/{eventId}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/EventReportController.java — _hasRole('ADMIN')_)
- **GET /api/admin/reports/events/{eventId}/export/categories**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ExportController.java — _hasRole('ADMIN')_)
- **GET /api/admin/reports/events/{eventId}/export/winners**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ExportController.java — _hasRole('ADMIN')_)
- **GET /api/public/results/events/{eventId}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultPublicController.java)
- **GET /api/results**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **GET /api/results**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **POST /api/results**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **DELETE /api/results/items/{itemId}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **PUT /api/results/items/{itemId}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **DELETE /api/results/{id}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **GET /api/results/{id}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **PUT /api/results/{id}**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **POST /api/results/{id}/items**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **POST /api/results/{id}/publish**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)
- **POST /api/results/{id}/unpublish**  (web-voting-system-Branch-Sandaru/src/main/java/com/example/votingsystem/result/api/ResultAdminController.java — _hasRole('ADMIN')_)

## 🧮 Winner Calculation (typical logic)
- For each **Category**, count votes per **Nominee**.
- The nominee with the **highest count** is the **winner**; handle ties by business rule (e.g., co-winners or tie-break).
- Store computed results in a results table or serve on-demand from live aggregates.

## 📤 Exports
- **CSV**: per-category tallies and winners.
- **PDF-ready JSON**: summary payload for a PDF service or client-side print.
- Include metadata: event name, time window, generation timestamp, totals.

## 🧾 Example Response Shapes
**Category Result (JSON):**
```json
{"eventId": 1, "categoryId": 10, "categoryName": "Best Leader", "tallies": [{"nomineeId":21,"name":"A. Perera","votes":154},{"nomineeId":18,"name":"N. Silva","votes":132}], "winner":{"nomineeId":21,"name":"A. Perera","votes":154}}
```

**Published Results List:**
```json
[{"categoryId":10,"categoryName":"Best Leader","winner":"A. Perera"},{"categoryId":11,"categoryName":"Best Innovator","winner":"K. Jayasekara"}]
```

## 🧠 Edge Cases & Validation
- **No votes cast** for a category → mark as `NO_RESULT` or `PENDING`.
- **Ties** → co-winners or tie-break rule (document your approach).
- **Voting window** must be CLOSED before generation (avoid partial results).
- **Idempotency**: re-generating results should overwrite or version previous summaries predictably.

## 🧪 Testing Tips
- Seed small events with known distributions to verify tallies.
- Unit-test aggregation queries and tie-handling logic.
- Verify role guards return **403** for non-admins.

## 🛠 Troubleshooting
- **403 Forbidden** → Missing/invalid token or insufficient role.
- **Empty results** → Ensure event status is CLOSED and votes exist.
- **Export errors** → Confirm content type and file streaming headers.
