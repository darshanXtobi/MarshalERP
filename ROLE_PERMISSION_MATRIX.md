# ROLE PERMISSION MATRIX: MARSHAL COLLEGE ERP

## 1. User Roles in System
1. **Super Admin**: Complete institution-wide system administration, audit logs, configuration.
2. **Principal / College Admin**: Institutional dashboards, overall reports, faculty & student oversight.
3. **Examination Controller**: Assessment rules, mark lock, SGPA/CGPA result calculation, marksheet publishing.
4. **HOD (Head of Department)**: Departmental curriculum, faculty load, attendance monitoring, mark approval.
5. **Faculty / Teacher**: Lecture attendance entry, internal & practical mark entry, student advisory.
6. **Accounts / Fee Admin**: Fee head structures, concessions, payment entry, receipt generation, financial reports.
7. **Transport Admin**: Bus routes, stops, bus passes, vehicle tracking, transport dues.
8. **Student / Learner**: Access to own profile, own attendance, own published marksheets, own fee dues/receipts, transport details, grievances.

---

## 2. Granular Operations Matrix

| Functional Module | Operation | Super Admin | Principal | Exam Controller | HOD | Faculty | Accounts | Transport | Student / Learner |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Authentication** | Login & Token Refresh | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes (Student Portal) |
| **User Management**| Create Staff & Assign Roles | Yes | No | No | No | No | No | No | No |
| **Academic Registry**| Create Depts, Programs, Courses| Yes | Read | No | Dept Only| Read | No | No | Read (Enrolled) |
| **Student Profiles**| Create/Enroll Student | Yes | Read | Read | Dept Only| Read | Read | Read | Read (Own Only) |
| **Student Profiles**| Edit Student Profile | Yes | Yes | No | Dept Only| No | No | No | Edit Own Contact |
| **Attendance** | Schedule Lecture Session | Yes | Read | No | Dept Only| Own Course| No | No | No |
| **Attendance** | Mark Student Attendance | Yes | No | No | Dept Only| Own Course| No | No | No |
| **Attendance** | Edit Attendance (Lock window)| Yes | Yes | No | Dept Only| Within 24h| No | No | No |
| **Attendance** | View Attendance Reports | Yes | Yes | Read | Dept Only| Own Course| No | No | View Own Summary |
| **Examinations** | Configure Exams & Components| Yes | Read | Yes | Dept Only| Read | No | No | View Schedule |
| **Examinations** | Enter Student Marks | Yes | No | Yes | Dept Only| Assigned | No | No | No |
| **Examinations** | Lock Mark Entry | Yes | No | Yes | No | No | No | No | No |
| **Examinations** | Calculate SGPA / CGPA Engine| Yes | Read | Yes | No | No | No | No | No |
| **Examinations** | Publish Results to Learner | Yes | Yes | Yes | No | No | No | No | No |
| **Marksheets** | View Gradecard / Marksheet | Yes | Yes | Yes | Dept Only| Assigned | No | No | View Own (If Published)|
| **Admit Cards** | Issue / Print Hall Tickets | Yes | Yes | Yes | Dept Only| Read | No | No | Download Own |
| **Fees & Accounts** | Define Fee Structures | Yes | Read | No | No | No | Yes | No | View Applicable |
| **Fees & Accounts** | Record Payment & Issue Receipt| Yes | No | No | No | No | Yes | No | No |
| **Fees & Accounts** | Grant Fee Concession | Yes | Yes | No | No | No | Yes | No | No |
| **Fees & Accounts** | View Financial Summaries | Yes | Yes | No | No | No | Yes | No | View Own Ledger |
| **Transport** | Manage Routes & Stops | Yes | Read | No | No | No | No | Yes | View Enrolled |
| **Transport** | Issue Bus Passes | Yes | No | No | No | No | No | Yes | Download Own |
| **Timetable** | Create & Modify Timetable | Yes | Read | No | Dept Only| Read | No | No | View Enrolled |
| **Notices** | Post Campus Announcement | Yes | Yes | Yes | Dept Only| Dept Only| Yes | Yes | View Targeted |
| **Grievances** | File Grievance Ticket | No | No | No | No | No | No | No | File Own Ticket |
| **Grievances** | Resolve Grievance Ticket | Yes | Yes | In-Scope | Dept Only| In-Scope| In-Scope| In-Scope| View Own Ticket |
| **Live Monitoring** | Real-Time Live Marksheet Monitor| Yes | Yes | Yes | Dept Only| Assigned | No | No | No (Audited Client) |
| **Audit Logs** | View System Security Audit | Yes | Read | No | No | No | No | No | No |

---

## 3. Strict Server-Side Isolation Guard
Every API endpoint validates incoming JWT claims:
```javascript
// Example Object-Level Access Control for Students
if (req.user.role === 'student' && req.params.studentId !== req.user.studentId) {
  return res.status(403).json({ error: 'AccessForbidden: You are not authorized to access records belonging to another student.' });
}
```
If a student tampers with an ID in the URL, query parameters, or payload body, the server rejects the request with HTTP `403 Forbidden` and records a security audit entry.
