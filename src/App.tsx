import  { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminProvider } from './context/AdminContext';
import { CMSProvider } from './context/CMSContext';
import PreviewBadge from './components/PreviewBadge';
import { GlobalLoadingFallback } from './components/GlobalLoadingFallback';



import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';
import { Home } from './routes/Home';
import { About } from './routes/About';
import { Services } from './routes/Services';
import { Technologies } from './routes/Technologies';
import { EleastarAndYou } from './routes/EleastarAndYou';
import { ServiceDetail } from './routes/ServiceDetail';
import { VerificationPage } from './routes/VerificationPage';
import { CareersPage } from './routes/CareersPage';
import { Contact } from './routes/Contact';
import { LoginPage } from './routes/LoginPage';
import { DynamicPage } from './routes/DynamicPage';
import { AdminDashboard } from './modules/admin-dashboard/pages/AdminDashboard';
import { NotificationsPage } from './routes/admin/NotificationsPage';
import { Employees } from './routes/admin/Employees';
import { PayrollPage } from './routes/admin/PayrollPage';
import { QRPage } from './routes/admin/QRPage';
import { RecruitmentPage } from './routes/admin/RecruitmentPage';
import { LeaveManagement } from './routes/admin/LeaveManagement';
import { PerformancePage } from './routes/admin/PerformancePage';
import { CMSPage } from './routes/admin/CMSPage';
import { AdminTasksPage } from './routes/admin/AdminTasksPage';
import { SettingsPage } from './routes/admin/SettingsPage';
import { ProfilePage } from './routes/admin/ProfilePage';
import { ActivityLogPage } from './routes/admin/ActivityLogPage';
import { PromotionsPage } from './routes/admin/PromotionsPage';
import { DepartmentSettings } from './routes/admin/DepartmentSettings';
import { BonusPage } from './routes/admin/BonusPage';
import { AnalyticsDashboard } from './routes/admin/AnalyticsDashboard';
import { ComplianceReportsPage } from './routes/admin/ComplianceReportsPage';
import { UserDashboard } from './routes/user/UserDashboard';
import { UserProfilePage } from './routes/user/UserProfilePage';

import { LeavePage } from './routes/user/LeavePage';
import { UserTasksPage } from './routes/user/UserTasksPage';
import { PerformanceReviewPage } from './routes/user/PerformanceReviewPage';

function App() {
  return (
    <AdminProvider>
      <CMSProvider>
        <Router>
          <PreviewBadge />
          <Suspense fallback={<GlobalLoadingFallback />}>
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
                <Route path="compliance" element={<ComplianceReportsPage />} />
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
          </Suspense>
        </Router>
      </CMSProvider>
    </AdminProvider >
  );
}

export default App;
