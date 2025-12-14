import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  Dashboard,
  Login,
  Register,
  OTP,
  ForgotPassword,
  TaskCanvasPage,
  TimesheetPage,
  TimesheetsView,
  UserManagement
} from './pages';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks/canvas" element={<ProtectedRoute><TaskCanvasPage /></ProtectedRoute>} />
        <Route path="/timesheet" element={<ProtectedRoute><TimesheetPage /></ProtectedRoute>} />
        <Route path="/timesheets" element={<ProtectedRoute><TimesheetsView /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
