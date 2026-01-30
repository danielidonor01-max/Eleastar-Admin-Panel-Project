import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { VerificationPage } from './pages/VerificationPage';
import { CareersPage } from './pages/CareersPage';
import { Contact } from './pages/Contact';
import { LoginPage } from './pages/LoginPage';

// Admin Imports
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Employees } from './pages/admin/Employees';
import { QRPage } from './pages/admin/QRPage';
import { PayrollPage } from './pages/admin/PayrollPage';
import { RecruitmentPage } from './pages/admin/RecruitmentPage';
import { CMSPage } from './pages/admin/CMSPage';
import { LeaveManagement } from './pages/admin/LeaveManagement';
import { PerformancePage } from './pages/admin/PerformancePage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { AdminProvider } from './context/AdminContext';
import { ProfilePage } from './pages/admin/ProfilePage';
import { UserLayout } from './layouts/UserLayout';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { LeavePage } from './pages/user/LeavePage';
import { PerformanceReviewPage } from './pages/user/PerformanceReviewPage';
import PreviewBadge from './components/PreviewBadge';

function App() {
  return (
    <AdminProvider>
      <Router>
        <PreviewBadge />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/industrial-solutions" element={<ServiceDetail pageName="IndustrialSolutions" />} />
          <Route path="/services/information-technology" element={<ServiceDetail pageName="InformationTechnology" />} />
          <Route path="/services/research-and-development" element={<ServiceDetail pageName="ResearchAndDevelopment" />} />
          <Route path="/services/electronics-manufacturing" element={<ServiceDetail pageName="ElectronicsManufacturing" />} />
          <Route path="/services/specific-it-services" element={<ServiceDetail pageName="SpecificITServices" />} />
          <Route path="/verify/:id" element={<VerificationPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="qr" element={<QRPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route path="leave" element={<LeaveManagement />} /> {/* Added route */}
            <Route path="performance" element={<PerformancePage />} />
            <Route path="cms" element={<CMSPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            {/* Fallback for unimplemented admin routes */}
            <Route path="*" element={<Dashboard />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="performance" element={<PerformanceReviewPage />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
