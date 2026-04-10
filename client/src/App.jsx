import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MatchesPage from './pages/MatchesPage.jsx';
import MatchDetailsPage from './pages/MatchDetailsPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuthStore } from './store/authStore.js';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminUserDetails from './pages/admin/AdminUserDetails.jsx';
import AdminBets from './pages/admin/AdminBets.jsx';
import AdminLiveBets from './pages/admin/AdminLiveBets.jsx';
import AdminLiveQuestions from './pages/admin/AdminLiveQuestions.jsx';
import AdminMatches from './pages/admin/AdminMatches.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminTransactions from './pages/admin/AdminTransactions.jsx';
import AdminRecharge from './pages/admin/AdminRecharge.jsx';
import AdminWithdraw from './pages/admin/AdminWithdraw.jsx';
import AdminRechargeHistory from './pages/admin/AdminRechargeHistory.jsx';
import AdminWithdrawHistory from './pages/admin/AdminWithdrawHistory.jsx';
import AdminResults from './pages/admin/AdminResults.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminTemplatesManager from './pages/admin/AdminTemplatesManager.jsx';
import LanguageSwitcher from "./LanguageSwitcher";
import { applyStoredLanguage } from "./utils/autoTranslate";
import PaymentPage from './pages/auth/PaymentPage.jsx';
import UpiSettingsPage from './pages/admin/AdminUpiUpdate.jsx';

export default function App() {
  const { loadUserFromToken } = useAuthStore();

  useEffect(() => {
    loadUserFromToken();
  }, []);
  useEffect(() => {
    applyStoredLanguage();
  }, []);

  return (
    <>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
                <MatchesPage />
            
            }
          />

          <Route
  path="/payment"
  element={
    <ProtectedRoute>
      <PaymentPage />
    </ProtectedRoute>
  }
/>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:id"
            element={
              <ProtectedRoute>
                <MatchDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="bets" element={<AdminBets />} />
          <Route path="live-bets" element={<AdminLiveBets />} />
          <Route path="live-questions" element={<AdminLiveQuestions />} />
          <Route path="matches" element={<AdminMatches />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="templates" element={<AdminTemplatesManager />} />
          <Route path="Upi-Upadte" element={<UpiSettingsPage />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="recharge" element={<AdminRecharge />} />
          <Route path="withdraw" element={<AdminWithdraw />} />
          <Route path="recharge-history" element={<AdminRechargeHistory />} />
          <Route path="withdraw-history" element={<AdminWithdrawHistory />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
