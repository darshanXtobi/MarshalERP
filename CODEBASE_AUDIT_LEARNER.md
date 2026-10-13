# CODEBASE AUDIT: SOURCE PROJECT B (LEARNER / STUDENT PORTAL - `student rp`)

## 1. Executive Summary & Project Identification
- **Original Path**: `C:\Burp\erp1\pceterpin\student rp`
- **Identity & Architecture**: Student-Facing Learner Web Portal for EduPlusCampus / PCCOE higher education institutions.
- **File Asset Scale**: 738 total files (737 active JavaScript and CSS modular bundles, 1 HTML template).
- **Core Technology Stack**:
  - Framework: Vue 3 with Vuetify 3 (`VNavigationDrawer`, `VTabs`, `VTable`, `VSkeletonLoader`, `VOtpInput`, `VPagination`, `VTooltip`, etc.).
  - Utilities: `jspdf.plugin.autotable`, `xlsx`, `moment`, `vue3-barcode` (for ID cards & Hall Tickets), `chart.js` (for CGPA/SGPA progression & attendance pie charts).
  - Unique Modules Discovered: 454 modular student components.

---

## 2. In-Depth Component Analysis & API Interactions

### A. Authentication & Session Security (`LoginPageNew-CTT7jDSN.js`)
- **Key Flows**:
  - Sign-in: `POST /AppLoginNew/signin`
  - MFA / OTP: `POST /AppLoginNew/checkOtpBase`, `POST /AppLoginNew/registerMFA`
  - Forgot Password: `POST /appLogin/savechangepassword`, `POST /AppLogin/verifyemail`
  - College Branding: `POST /AppLoginNew/getLoginLogo`
- **State & Tokens**:
  - Access Token stored in `localStorage.setItem("EPS-TOKEN", token)`
  - Refresh Token stored in `localStorage.setItem("EPS-REFRESH-TOKEN", refreshToken)`
  - Learner Session variables: `eps-uid`, `eps-loginid`, `eps-orgid`, `eps-learnerid`, `name`, `logo`

### B. Student Dashboard (`student_dashboard-CSeoEp5A.js`, 108 KB)
- **Features**:
  - Project task tracking (`todlist`, `inprocesslist`, `donelist`, `rejectlist`).
  - Capstone project review milestones, communication log with guide, and report uploads.
  - Overall academic statistics summary cards.
- **Endpoints**:
  - `POST /ProjectGroup/mainStudentDashboard`
  - `POST /ProjectGroup/getUserStatistics`
  - `POST /ProjectGroup/getMyTaskDetails`
  - `POST /ProjectGroup/getProjectMembers`

### C. Attendance Management (`Attendence-DaQxynf0.js`)
- **Features**:
  - Academic Year (`ay`) and Semester (`sem`) dropdown filters.
  - Subject-wise table: Subject Code, Subject Name, Conducted Lectures, Attended Lectures, Percentage.
  - Color-coded percentage indicators (Green >= 75%, Orange 60-74%, Red < 60%).
  - Overall cumulative attendance banner.
- **Endpoints**:
  - `POST /AppLearnerAcademics/learnerAttendenceTable`
  - `GET/POST /appLearnerAcademics/learnerAttendence?ay=<ay>&sem=<sem>`

### D. Examination, Marksheets & SGPA/CGPA Gradecards (`gradecard-oABT_PVL.js`, 303 KB)
- **Features**:
  - Academic year and semester selection.
  - Official grade card tabular view:
    - Course Code, Course Name, Credits ($C_i$), Grade Point ($G_i$), Letter Grade ($O, A+, A, B+, B, C, P, F$), Credit Points ($C_i \times G_i$).
    - Calculation of Total Credits Earned, Total Credit Points, SGPA ($SGPA = \frac{\sum C_i \cdot G_i}{\sum C_i}$).
    - Cumulative Grade Point Average (CGPA) progression across prior semesters.
    - Result Status: `PASS`, `ATKT / FAIL`, `WITHHELD`.
  - Print formatting with institutional watermark, header, signature zones, and anti-tamper barcode via `vue3-barcode`.
- **Endpoints**:
  - `POST /AppLearnerExamination/getExamAySem`
  - `POST /AppLearnerExamination/learner_grade_card_viit`
  - `POST /AppLearnerExamination/learner_final_ledger`
  - `POST /ERPLearnerGradeResultSP/fetchlearnergradecardSPC`
  - `POST /AppLearnerExamination/IsProgramPercentageBased`

### E. Hall Tickets & Admit Cards (`BacklogHallTicket-y7aiHymM.js`, `VuRegularHallTicket`)
- **Features**:
  - Regular and Backlog / ATKT examination admit cards.
  - Candidate photo, Seat Number, PRN Number, Exam Centre, Subject Schedule timetable table with Supervisor Signature column.
- **Endpoints**:
  - `POST /AppLearnerExamination/getStudentHallTicketBacklog`
  - `POST /AppLearnerExamination/getOfferingAcademicYear`

### F. Fees, Dues & Receipts (`QuickPayRegularReceipt-o06R8p86.js`, `AdhockReceipt`)
- **Features**:
  - Fee head component breakdown (Tuition, Development, Library, Gymkhana, Exam Fee).
  - Transaction history, Payment Mode, Bank Transaction Reference, Receipt Number.
  - Printable official 3-copy fee receipt (Student Copy, Bank Copy, College Copy).
- **Endpoints**:
  - `POST /OnlinePayments/admissionreceipt`
  - `POST /OnlinePayments/makePayment`

### G. Transport & Commute Receipts (`ViewTransportFeesReceipt-DWhBVObx.js`)
- **Features**:
  - Bus Route Name, Pick-up Stop, Bus Number, Validity Period, Transport Fee Paid and Outstanding.
- **Endpoints**:
  - `POST /Transport/getViewTransportFeesReceipt`

### H. Comprehensive Student Profile & Dossier (`FillProfile-DHU1fi_s.js`, 887 KB)
- **Features**:
  - Personal Information, Permanent & Correspondence Address, Blood Group, Category/Caste.
  - Previous Academic Qualifications (10th, 12th, Diploma marksheets).
  - Bank Account Details for scholarships, Emergency Contacts.

---

## 3. Integration Blueprint: Preserving Learner UX
- The Learner Portal UI is preserved and connected directly to the central MarshalERP database engine.
- Hardcoded endpoints are backed by authoritative server routes that enforce strict student isolation:
  $$\forall s \in \text{Students}, \quad \text{Access}(s, \text{Record } r) \iff r.\text{student\_id} = s.\text{id}$$
- Live updates allow students to view published marks and marksheets the moment staff approves them in the ERP.
