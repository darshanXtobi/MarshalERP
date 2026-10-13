# CODEBASE AUDIT: SOURCE PROJECT A (STAFF / COLLEGE ERP - `pceterpin`)

## 1. Executive Summary & Project Identification
- **Original Path**: `C:\Burp\erp1\pceterpin`
- **Identity & Architecture**: EduPlusCampus / PCCOE ERP System (Enterprise College Management System).
- **Core Technology Stack**:
  - Frontend: Vue.js 3 with Vuetify 3 (`VAlert`, `VApp`, `VAutocomplete`, `VBadge`, `VCheckbox`, `VTable`, `VTabs`, `VForm`, `VNavigationDrawer`, `VMain`, etc.)
  - Build Tool / Bundler: Vite / Rollup modular chunk architecture.
  - Runtime Libraries: Axios, MathJax (TeX formulas), CKEditor, jQuery + Table2Excel, SheetJS (xlsx), Freshworks live support widget.
  - Component Architecture: 332 individual module chunks identified covering the entire spectrum of higher education administration.

---

## 2. Discovered Functional Domains & Component Inventory

### A. Academics & Attendance Management (29 Modules)
- `CourseAttendance`, `CourseAttendanceDetails`: Lecture/lab session attendance recording.
- `attendanceSheet`: Student roll list with attendance grid per lecture/date.
- `AttendanceAnalysisDashboard`: Percentage calculation, shortage threshold warnings (<75%), aggregate reporting.
- `yearlyAttendaceReport`: Academic year cumulative attendance analytics.
- `CoursePlan`, `AddCoursePlan`, `coursePlanExecutionReport`: Syllabus unit mapping, lecture delivery tracking.
- `AddSyllabus`, `AddTopic`: Course curriculum breakdown.
- `divtimetable`: Division-wise timetable scheduling.
- `Attendee`: Attendance session management.

### B. Examination, Mark Entry & Result Processing (86 Modules)
- `BulkMarksEntry`, `ViewMarkEntry`: Faculty mark entry grids with roll number, student name, maximum marks, marks scored, and validation rules.
- `BulkMarksEntryApprove`: Multi-tier approval workflow (Faculty -> HOD -> Exam Controller).
- `BacklogMarksEntry`: Separate assessment flow for ATKT and backlog subjects.
- `AddCO`, `AddCOAssessmentMapping`: Outcome-Based Education (OBE) Course Outcomes mapping.
- `ViewCOAttainment`, `ViewCOAttainmentReport`, `ViewPOAttainment`: Program Outcome & CO calculation engines.
- `carReport`: Continuous Assessment Report per division/subject.
- `awardDynamic`: Merit lists and institutional awards.

### C. Student Admissions & Lifecycle (7 Modules)
- `ViewLearnerDetails`: Complete 360-degree profile (PRN, Roll No, Branch, Division, Batch, Category, Contact, Parent info).
- `ViewFillProfile`: Document verification and student registration.
- `getStudentOfferingList`: Semester course registration lists.
- `IndividualLearnerMeetingSchedule`: Mentor-mentee counseling logs.
- `ProfileTab`: Tabular student record management.

### D. Fee Accounts & Finance (18 Modules)
- `AddInvoice`, `viewBill`: College fee structure definition.
- `PayEventFees`, `ViewEventFeesReceipt`: Extra-curricular and departmental activity collections.
- `vendorClientList`, `vendorHistory`, `VendorQuotation`, `AddInvoice`: Procurement and operational expenditure tracking.

### E. Staff, Faculty & HR Management (24 Modules)
- `applyLeave`, `apply_leave_new`, `editLeave`, `approve_load_adjustment_new`: Faculty leave application with proxy lecture load adjustments.
- `AddTimeSheet`, `AddTimeSheetNew`: Non-teaching and teaching daily activity logging.
- `Biometric`, `BiometricDashboard`: Biometric punch integration and staff daily presence.
- `AppraisalDashboard`: Annual performance appraisal system for faculty.

### F. Transport, Hostel & Campus Infrastructure (2 Modules)
- `BookInfraStructure`: Lab, auditorium, and classroom booking system.
- `ViewDeadstock`: Asset register and laboratory equipment inventory.

### G. LMS, Quizzes & Assessments (16 Modules)
- `Quiz`, `CreateQuiz`, `quizScheduling`, `addStudentToQuiz`: Online multiple-choice and descriptive examination system.
- `getQuizQuestionDetails`, `viewQuizResponse`, `viewQuizAnswers`: Question paper generation, automated grading.
- `assignmentDashboard`, `getAssignmentList`: Homework/lab assignment submission and marking.

### H. Administration, Dynamic Forms & Workflow Engine (150 Modules)
- `AdminDynamic`: Dynamic metadata and form fields configurator.
- `activityDashboard`, `activityWorkFlowSetting`: Institutional event and audit approvals.
- `addQuery`, `addResourceBank`, `addTemplateDetails`, `addTestcases`: Coding testcase engine and question bank repository.

---

## 3. Communication, Authentication & API Contract Analysis
- **Authentication**: JWT-based bearer token passed in request headers (`Authorization: Bearer <EPS-TOKEN>`).
- **Storage Strategy**:
  - `EPS-TOKEN`: Stored in browser `localStorage`.
  - `eps-uid`, `eps-orgid`, `eps-loginid`: User and college institution identifier.
- **API Paradigm**: JSON POST/GET APIs targeting unified controller endpoints (`/AppLearner*`, `/ProjectGroup/*`, `/Transport/*`, `/OnlinePayments/*`).

---

## 4. Reusable Assets & Architectural Gaps
- **Reusable Strengths**:
  - Complete, battle-tested educational nomenclature (PRN, Division, Batch, AY, Sem, Seat No, SGPA, CGPA, Backlog, CO/PO).
  - Production-grade Vuetify 3 component layouts for attendance tables, mark entry, gradecards, and fee registers.
- **Gaps Identified**:
  - Scraped static bundle files require live database-backed REST & WebSocket endpoints.
  - Mark entry and marksheet publishing needs atomic database transactions with an official calculation engine.
  - Multi-portal architecture needed to serve both Staff ERP and Learner Student site from one authoritative source of truth.
