import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './components/auth/AuthPage';
import PitchMonitor from './components/pitch/PitchMonitor';
import CalibrationWizard from './components/calibration/CalibrationWizard';
import VocalTraining from './components/training/VocalTraining';
import ChoirMode from './components/choir/ChoirMode';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import ProfilePage from './components/profile/ProfilePage';

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <AuthPage />;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<PitchMonitor />} />
          <Route path="calibrate" element={<CalibrationWizard />} />
          <Route path="training" element={<VocalTraining />} />
          <Route path="choir" element={<ChoirMode />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
