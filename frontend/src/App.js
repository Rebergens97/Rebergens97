import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import DonatePage from "./pages/DonatePage";
import CampaignPage from "./pages/CampaignPage";
import CampaignsPage from "./pages/CampaignsPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import TransparencyPage from "./pages/TransparencyPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import ThankYouPage from "./pages/ThankYouPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import ChangePasswordPage from "./pages/admin/ChangePasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage";
import AdminDonationsPage from "./pages/admin/AdminDonationsPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminUpdatesPage from "./pages/admin/AdminUpdatesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/campaign/:slug" element={<CampaignPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/change-password" 
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'editor', 'viewer']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/campaigns" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <AdminCampaignsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/donations" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <AdminDonationsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/posts" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'editor']}>
                  <AdminPostsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'editor']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/updates" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'editor']}>
                  <AdminUpdatesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
