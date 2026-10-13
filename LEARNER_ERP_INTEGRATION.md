# LEARNER & STAFF ERP INTEGRATION ARCHITECTURE

## 1. Integration Paradigm
MarshalERP connects the Staff-Facing ERP (`pceterpin`) and the Student-Facing Learner Portal (`student rp`) into one reactive, single-source-of-truth ecosystem.

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty / Exam Staff
    participant ERP as Staff ERP Portal
    participant API as Marshal Authoritative Engine
    participant DB as Relational Database & KV
    participant WS as WebSocket Hub
    actor Student as Student (Learner)
    participant LP as Learner Student Portal

    Note over Student, LP: Student logs in with PRN
    LP->>API: POST /api/auth/student-login
    API->>DB: Verify PRN & Password
    API-->>LP: JWT (EPS-TOKEN) + Profile
    LP->>WS: Connect WebSocket (Student Session)

    Note over Faculty, ERP: Faculty marks attendance or enters marks
    Faculty->>ERP: Submits Exam Marks
    ERP->>API: POST /api/exams/marks
    API->>DB: Store Student Marks in DB
    
    Note over Faculty, ERP: Exam Controller approves & publishes
    Faculty->>ERP: Click "Publish Marksheet"
    ERP->>API: POST /api/exams/:id/publish
    API->>DB: Run Official SGPA/CGPA Engine & Set is_published=TRUE
    API->>WS: Broadcast EVENT: MARKSHEET_PUBLISHED
    
    WS-->>LP: Real-time Notification Event
    LP->>API: GET /api/exams/gradecard/:studentId/:examId
    API->>DB: Fetch Published Gradecard
    API-->>LP: Returns Computed Marksheet
    LP->>LP: Renders Live Marksheet & Watermark

    Note over Student, LP: Student views Marksheet
    LP->>WS: SEND { action: "VIEWING_MARKSHEET", studentId: "..." }
    WS-->>ERP: Live Monitor: Student is actively viewing marksheet!
    ERP->>ERP: Update Live Student Monitor Widget
```

---

## 2. Shared Data Entities & Consistency Rules

### 1. Consistent Student Identity
- Single primary key `students.id` (UUID) paired with `prn` (Permanent Registration Number) and `roll_no`.
- Staff ERP searches students by PRN/Roll No/Name; Learner Portal identifies authenticated student directly from token claims.

### 2. Live Marksheet Synchronization
- **Draft State**: While faculty is entering or adjusting marks, `is_published = FALSE`. The student portal shows:
  *"Assessment evaluated. Awaiting official Controller publication."*
- **Publication State**: When Exam Controller clicks **Publish**, the backend calculates:
  - Subject Totals, Letter Grades, Grade Points.
  - Credit Points ($C_i \times G_i$).
  - Semester SGPA and cumulative CGPA.
  - Sets `is_published = TRUE` and invalidates KV cache.
  - Pushes an immediate WebSocket broadcast. The student portal refreshes instantly.

### 3. Live Active Student / Marksheet Monitor
- When students navigate to `/examinations/gradecard`, the student portal registers a heartbeat with the WebSocket hub.
- The Staff ERP's **Live Monitor** dashboard widget displays:
  - Number of students currently online.
  - List of students actively inspecting their marksheets in real time.
  - Timestamp of student access and IP/device metadata.

### 4. Attendance Synchronization
- When faculty marks a session, total lectures conducted and attended increment immediately.
- The learner portal's attendance percentage gauge updates instantly upon subsequent query or push event.

### 5. Financial Reconciliation
- Accounts staff enters a payment (Cash/Online/Cheque) $\rightarrow$ updates `student_fee_accounts.total_paid` and `balance` atomically inside a database transaction.
- Learner portal shows zero discrepancy between staff accounts balance and student dues.
