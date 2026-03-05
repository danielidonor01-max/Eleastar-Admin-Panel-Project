import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminProvider } from './context/AdminContext';
import { CMSProvider } from './context/CMSContext';
import PreviewBadge from './components/PreviewBadge';
import { GlobalLoadingFallback } from './components/GlobalLoadingFallback';

// ----------------------------------------------------------------------
// Layouts (Loaded synchronously so the outer shell renders immediately)
// ----------------------------------------------------------------------
import { AdminLayout } from './layouts/AdminLayout';
import { UserLayout } from './layouts/UserLayout';

// ----------------------------------------------------------------------
// Lazy Loaded Public Pages
// ----------------------------------------------------------------------
const Home = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const About = React.lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Services = React.lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const Technologies = React.lazy(() => import('./pages/Technologies').then(m => ({ default: m.Technologies })));
const EleastarAndYou = React.lazy(() => import('./pages/EleastarAndYou').then(m => ({ default: m.EleastarAndYou })));
const ServiceDetail = React.lazy(() => import('./pages/ServiceDetail').then(m => ({ default: m.ServiceDetail })));
const VerificationPage = React.lazy(() => import('./pages/VerificationPage').then(m => ({ default: m.VerificationPage })));
const CareersPage = React.lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const Contact = React.lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DynamicPage = React.lazy(() => import('./pages/DynamicPage').then(m => ({ default: m.DynamicPage })));

// ----------------------------------------------------------------------
// Lazy Loaded Admin Pages
// ----------------------------------------------------------------------
const AdminDashboard = React.lazy(() => import('./modules/admin-dashboard/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Employees = React.lazy(() => import('./pages/admin/Employees').then(m => ({ default: m.Employees })));
const QRPage = React.lazy(() => import('./pages/admin/QRPage').then(m => ({ default: m.QRPage })));
const PayrollPage = React.lazy(() => import('./pages/admin/PayrollPage').then(m => ({ default: m.PayrollPage })));
const RecruitmentPage = React.lazy(() => import('./pages/admin/RecruitmentPage').then(m => ({ default: m.RecruitmentPage })));
const CMSPage = React.lazy(() => import('./pages/admin/CMSPage').then(m => ({ default: m.CMSPage })));
const LeaveManagement = React.lazy(() => import('./pages/admin/LeaveManagement').then(m => ({ default: m.LeaveManagement })));
const PerformancePage = React.lazy(() => import('./pages/admin/PerformancePage').then(m => ({ default: m.PerformancePage })));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = React.lazy(() => import('./pages/admin/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
// Removed unused CompliancePage default import and duplicate lazy load declaration
const CompliancePageDefault = React.lazy(() => import('./pages/admin/CompliancePage'));
const ActivityLogPage = React.lazy(() => import('./pages/admin/ActivityLogPage').then(m => ({ default: m.ActivityLogPage })));
const PromotionsPage = React.lazy(() => import('./pages/admin/PromotionsPage').then(m => ({ default: m.PromotionsPage })));
const DepartmentSettings = React.lazy(() => import('./pages/admin/DepartmentSettings').then(m => ({ default: m.DepartmentSettings })));
const BonusPage = React.lazy(() => import('./pages/admin/BonusPage').then(m => ({ default: m.BonusPage })));
const AnalyticsDashboard = React.lazy(() => import('./pages/admin/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const AdminTasksPage = React.lazy(() => import('./pages/admin/AdminTasksPage').then(m => ({ default: m.AdminTasksPage })));
const ComplianceReportsPage = React.lazy(() => import('./pages/admin/ComplianceReportsPage').then(m => ({ default: m.ComplianceReportsPage })));
const ProfilePage = React.lazy(() => import('./pages/admin/ProfilePage').then(m => ({ default: m.ProfilePage })));

// ----------------------------------------------------------------------
// Lazy Loaded User Pages
// ----------------------------------------------------------------------
const UserDashboard = React.lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const UserProfilePage = React.lazy(() => import('./pages/user/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const LeavePage = React.lazy(() => import('./pages/user/LeavePage').then(m => ({ default: m.LeavePage })));
const PerformanceReviewPage = React.lazy(() => import('./pages/user/PerformanceReviewPage').then(m => ({ default: m.PerformanceReviewPage })));
const UserTasksPage = React.lazy(() => import('./pages/user/UserTasksPage').then(m => ({ default: m.UserTasksPage })));

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
                <Route path="compliance" element={<CompliancePageDefault />} />
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
