import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Technologies } from './pages/Technologies';
import { EleastarAndYou } from './pages/EleastarAndYou';
import { ServiceDetail } from './pages/ServiceDetail';
import { VerificationPage } from './pages/VerificationPage';
import { CareersPage } from './pages/CareersPage';
import { Contact } from './pages/Contact';
import { LoginPage } from './pages/LoginPage';
import { DynamicPage } from './pages/DynamicPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Admin Imports
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './modules/admin-dashboard/pages/AdminDashboard';
import { Employees } from './pages/admin/Employees';
import { QRPage } from './pages/admin/QRPage';
import { PayrollPage } from './pages/admin/PayrollPage';
import { RecruitmentPage } from './pages/admin/RecruitmentPage';
import { CMSPage } from './pages/admin/CMSPage';
import { LeaveManagement } from './pages/admin/LeaveManagement';
import { PerformancePage } from './pages/admin/PerformancePage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { NotificationsPage } from './pages/admin/NotificationsPage';
import CompliancePage from './pages/admin/CompliancePage';
import { ActivityLogPage } from './pages/admin/ActivityLogPage';
import { PromotionsPage } from './pages/admin/PromotionsPage';
import { DepartmentSettings } from './pages/admin/DepartmentSettings';
import { BonusPage } from './pages/admin/BonusPage';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { AdminTasksPage } from './pages/admin/AdminTasksPage';

import { ComplianceReportsPage } from './pages/admin/ComplianceReportsPage';

import { AdminProvider } from './context/AdminContext';
import { ProfilePage } from './pages/admin/ProfilePage';
import { UserLayout } from './layouts/UserLayout';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { LeavePage } from './pages/user/LeavePage';
import { PerformanceReviewPage } from './pages/user/PerformanceReviewPage';
import { UserTasksPage } from './pages/user/UserTasksPage';
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
          <Route path="/technologies" element={<Technologies />} />
          <Route path="/eleastar-and-you" element={<EleastarAndYou />} />
          <Route path="/services/industrial-solutions" element={<ServiceDetail pageName="IndustrialSolutions" />} />
          <Route path="/services/information-technology" element={<ServiceDetail pageName="InformationTechnology" />} />
          <Route path="/services/research-and-development" element={<ServiceDetail pageName="ResearchAndDevelopment" />} />
          <Route path="/services/electronics-manufacturing" element={<ServiceDetail pageName="ElectronicsManufacturing" />} />
          <Route path="/services/specific-it-services" element={<ServiceDetail pageName="SpecificITServices" />} />
          <Route path="/verify/:id" element={<VerificationPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/:slug" element={<DynamicPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ErrorBoundary><AdminLayout /></ErrorBoundary>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="employees" element={<Employees />} />
            <Route path="qr" element={<QRPage />} />
            <Route path="payroll" element={<PayrollPage />} />
            <Route path="recruitment" element={<RecruitmentPage />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="performance" element={<PerformancePage />} />
            <Route path="cms" element={<CMSPage />} />
            <Route path="tasks" element={<AdminTasksPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="activity" element={<ActivityLogPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="salary-structures" element={<DepartmentSettings />} />
            <Route path="bonuses" element={<BonusPage />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />

            <Route path="compliance-reports" element={<ComplianceReportsPage />} />
            {/* Fallback for unimplemented admin routes */}
            <Route path="*" element={<AdminDashboard />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="leave" element={<LeavePage />} />
            <Route path="tasks" element={<UserTasksPage />} />
            <Route path="performance" element={<PerformanceReviewPage />} />
          </Route>
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
