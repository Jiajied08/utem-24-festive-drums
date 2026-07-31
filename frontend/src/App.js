import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthCallback from '@/components/AuthCallback';
import Home from '@/pages/Home';
import About from '@/pages/About';
import History from '@/pages/History';
import Team from '@/pages/Team';
import JoinUs from '@/pages/JoinUs';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminInstagram from '@/pages/admin/AdminInstagram';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminEnquiries from '@/pages/admin/AdminEnquiries';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminHistory from '@/pages/admin/AdminHistory';
import AdminAchievements from '@/pages/admin/AdminAchievements';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminHeroImages from '@/pages/admin/AdminHeroImages';

function AppContent() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/team" element={<Team />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/contact" element={<JoinUs />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instagram"
          element={
            <ProtectedRoute>
              <AdminInstagram />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <AdminGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute>
              <AdminEnquiries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <ProtectedRoute>
              <AdminHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/achievements"
          element={
            <ProtectedRoute>
              <AdminAchievements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/team"
          element={
            <ProtectedRoute>
              <AdminTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hero"
          element={
            <ProtectedRoute>
              <AdminHeroImages />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="App">
          <AppContent />
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;