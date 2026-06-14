import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import MedicalRecords from './pages/MedicalRecords';
import Settings from './pages/Settings';
import AISymptomAnalyzer from './pages/AISymptomAnalyzer';
import QueueDisplay from './pages/QueueDisplay';
import QueueManager from './pages/QueueManager';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/ai-analyzer" element={<AISymptomAnalyzer />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
  <Navbar />
  <div className="max-w-7xl mx-auto px-4 py-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/queue-display" element={<QueueDisplay />} />
<Route path="/queue-manager" element={<QueueManager />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;