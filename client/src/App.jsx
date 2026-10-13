import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

// Landing Hub
import PortalLanding from './pages/PortalLanding';

// Staff ERP
import ErpLayout from './erp/ErpLayout';
import StaffLoginPage from './erp/pages/StaffLoginPage';
import ErpDashboard from './erp/pages/ErpDashboard';
import LiveMonitorPage from './erp/pages/LiveMonitorPage';
import AttendanceEntryPage from './erp/pages/AttendanceEntryPage';
import AttendanceReportPage from './erp/pages/AttendanceReportPage';
import MarksEntryPage from './erp/pages/MarksEntryPage';
import ResultsPublishPage from './erp/pages/ResultsPublishPage';
import FeeManagementPage from './erp/pages/FeeManagementPage';
import TransportManagerPage from './erp/pages/TransportManagerPage';
import StudentsDirectoryPage from './erp/pages/StudentsDirectoryPage';

// Learner Portal
import LearnerLayout from './learner/LearnerLayout';
import StudentLoginPage from './learner/pages/StudentLoginPage';
import LearnerDashboard from './learner/pages/LearnerDashboard';
import MyAttendancePage from './learner/pages/MyAttendancePage';
import LiveGradeCardPage from './learner/pages/LiveGradeCardPage';
import HallTicketPage from './learner/pages/HallTicketPage';
import MyFeesPage from './learner/pages/MyFeesPage';
import MyTransportPage from './learner/pages/MyTransportPage';
import MyTimetablePage from './learner/pages/MyTimetablePage';
import MyGrievancesPage from './learner/pages/MyGrievancesPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            {/* Root Landing Hub */}
            <Route path="/" element={<PortalLanding />} />

            {/* Staff ERP Authentication */}
            <Route path="/staff/login" element={<StaffLoginPage />} />

            {/* Staff ERP Protected Portal */}
            <Route path="/staff" element={<ErpLayout />}>
              <Route index element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<ErpDashboard />} />
              <Route path="live-monitor" element={<LiveMonitorPage />} />
              <Route path="attendance" element={<AttendanceEntryPage />} />
              <Route path="attendance-reports" element={<AttendanceReportPage />} />
              <Route path="marks-entry" element={<MarksEntryPage />} />
              <Route path="results-publish" element={<ResultsPublishPage />} />
              <Route path="fees" element={<FeeManagementPage />} />
              <Route path="transport" element={<TransportManagerPage />} />
              <Route path="students" element={<StudentsDirectoryPage />} />
            </Route>

            {/* Student Learner Authentication */}
            <Route path="/learner/login" element={<StudentLoginPage />} />

            {/* Student Learner Portal */}
            <Route path="/learner" element={<LearnerLayout />}>
              <Route index element={<Navigate to="/learner/dashboard" replace />} />
              <Route path="dashboard" element={<LearnerDashboard />} />
              <Route path="attendance" element={<MyAttendancePage />} />
              <Route path="gradecard" element={<LiveGradeCardPage />} />
              <Route path="hall-ticket" element={<HallTicketPage />} />
              <Route path="fees" element={<MyFeesPage />} />
              <Route path="transport" element={<MyTransportPage />} />
              <Route path="timetable" element={<MyTimetablePage />} />
              <Route path="grievance" element={<MyGrievancesPage />} />
              <Route path="notices" element={<LearnerDashboard />} />
            </Route>

            {/* Legacy compatibility redirect for /student/* */}
            <Route path="/student/*" element={<Navigate to="/learner" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
