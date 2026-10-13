# MODULE ROUTE MAP: MARSHAL COLLEGE ERP

## 1. Application URL Structure & Portals
MarshalERP provides two interconnected web portal experiences connected to one authoritative backend:
- **Staff ERP Portal** (`/staff` or dedicated Staff App on Port 5173)
- **Learner Student Portal** (`/learner` or dedicated Student App on Port 5174)
- **Authoritative API & WebSocket Service** (Port 5000)

---

## 2. Staff ERP Route Map

| Route Path | View / Component | Purpose & Features | Permitted Roles |
|---|---|---|---|
| `/login` | `StaffLoginView` | Staff credential authentication with role selector | Public |
| `/dashboard` | `AdminDashboardView` | Institutional metrics, quick actions, attendance summary, live learner monitor | All Staff Roles |
| `/live-monitor` | `LiveMonitorView` | Real-time active student viewers on marksheets, login sessions, WebSocket monitor | Super Admin, Principal, Exam Controller |
| `/academics/departments` | `DepartmentListView` | Department and program configuration | Super Admin, Principal |
| `/academics/courses` | `CourseListView` | Course catalog, credit assignments, syllabus mapping | Admin, HOD |
| `/academics/timetables` | `TimetableView` | Division-wise schedule generator and room manager | Admin, HOD, Faculty |
| `/students` | `StudentListView` | 360-degree student registry, admissions, search, roll filters | All Staff |
| `/students/:id` | `StudentDetailView` | Full dossier: academic history, documents, dues, attendance | All Staff |
| `/attendance` | `AttendanceManagerView`| Select course, date, period; interactive roll call table with Bulk toggle | Faculty, HOD, Admin |
| `/attendance/reports` | `AttendanceReportView` | Division and subject-wise aggregate attendance, shortage warnings (<75%) | All Staff |
| `/examinations` | `ExamScheduleView` | Exam session creation (Regular, In-Sem, Backlog) | Exam Controller, Admin |
| `/examinations/marks-entry`| `MarksEntryView` | Tabular mark entry with real-time validation, absent flag, draft/submit | Faculty, Exam Controller |
| `/examinations/calculate` | `ResultProcessingView` | Execution of automated SGPA/CGPA engine, pass/fail ledger generation | Exam Controller, Admin |
| `/examinations/publish` | `ResultPublishView` | Final audit and publishing switch that releases marksheets to learners | Exam Controller, Admin |
| `/fees/structures` | `FeeStructureView` | Define program fee heads, installment dates | Accounts, Admin |
| `/fees/collections` | `FeeCollectionView` | Search student, collect payment, issue official receipt with receipt no | Accounts, Admin |
| `/fees/reports` | `FeeReportView` | Dues breakdown, daily collection tally, concession audits | Accounts, Admin, Principal |
| `/transport/routes` | `TransportRouteView` | Bus route configuration, stop timings, driver info | Transport Admin, Admin |
| `/transport/allocations` | `BusPassManagerView` | Assign students to bus routes, generate digital bus pass | Transport Admin, Admin |
| `/notices` | `NoticeManagerView` | Create and broadcast campus circulars and announcements | All Staff |
| `/grievances` | `GrievanceManagerView`| Departmental student inquiry response and ticket resolution | All Staff |
| `/audit-logs` | `AuditLogView` | Security logs, mark edit audit trails, payment logs | Super Admin |

---

## 3. Learner Student Portal Route Map

| Route Path | View / Component | Purpose & Features | Permitted Roles |
|---|---|---|---|
| `/login` | `StudentLoginView` | Student login with PRN/Roll No, password, and OTP assistance | Student |
| `/dashboard` | `LearnerDashboardView` | Personalized student dashboard, upcoming exams, fee alert, attendance ring | Student |
| `/profile` | `LearnerProfileView` | Student profile dossier, personal info, parent details, enrolled courses | Student |
| `/attendance` | `MyAttendanceView` | Subject-wise attendance grid, lectures conducted vs attended, percentage gauge | Student |
| `/examinations/schedule` | `ExamScheduleStudentView`| Upcoming exam timetable, reporting time, seat number | Student |
| `/examinations/hall-ticket`| `HallTicketView` | Printable examination admit card with photo and barcode | Student |
| `/examinations/gradecard`| `LiveGradeCardView` | **Live Marksheet**: Official grade card, subject credits, letter grades, SGPA, CGPA | Student |
| `/fees` | `MyFeesView` | Assessed fees, concessions, paid history, remaining balance | Student |
| `/fees/receipts/:receiptNo`| `FeeReceiptView` | Printable 3-copy fee receipt with college stamp and transaction details | Student |
| `/transport` | `MyTransportView` | Allocated bus route, designated stop, pickup time, bus pass card | Student |
| `/timetable` | `MyTimetableView` | Weekly class timetable with room numbers and faculty details | Student |
| `/notices` | `LearnerNoticesView` | Categorized college announcements and notices feed | Student |
| `/grievance` | `MyGrievanceView` | Submit new inquiry or complaint; track resolution status | Student |

---

## 4. Authoritative API Route Endpoints

### Auth Endpoints
- `POST /api/auth/staff-login`
- `POST /api/auth/student-login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### Academic & Student Endpoints
- `GET /api/departments`
- `GET /api/programs`
- `GET /api/courses`
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`

### Attendance Endpoints
- `GET /api/attendance/sessions`
- `POST /api/attendance/mark`
- `GET /api/attendance/student/:studentId`
- `GET /api/attendance/report`

### Examination & Marksheet Endpoints
- `GET /api/exams`
- `POST /api/exams`
- `GET /api/exams/:examId/components`
- `GET /api/exams/:examId/marks`
- `POST /api/exams/marks`
- `POST /api/exams/:examId/calculate`
- `POST /api/exams/:examId/publish`
- `GET /api/exams/gradecard/:studentId/:examId`
- `GET /api/exams/hall-ticket/:studentId/:examId`

### Financial & Transport Endpoints
- `GET /api/fees/structures`
- `GET /api/fees/student/:studentId`
- `POST /api/fees/pay`
- `GET /api/fees/receipt/:receiptNo`
- `GET /api/transport/routes`
- `GET /api/transport/student/:studentId`
- `POST /api/transport/assign`

### Real-Time & Live Monitoring Endpoints
- `GET /api/live/metrics`
- `POST /api/live/heartbeat`
- `WS /api/ws/live`
