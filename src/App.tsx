import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import HistoryPage from './pages/History';
import Admin from './pages/Admin';
import SystemBoot from './components/SystemBoot';
import Navbar from './components/Navbar';
import DigitalGrid from './components/DigitalGrid.tsx';

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
          <p className="text-slate-400 text-sm font-medium">Loading your session...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const [isBooted, setIsBooted] = React.useState(() => {
    return sessionStorage.getItem('system_booted') === 'true';
  });

  const handleBootComplete = () => {
    setIsBooted(true);
    sessionStorage.setItem('system_booted', 'true');
  };

  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          {!isBooted && <SystemBoot onComplete={handleBootComplete} />}
        </AnimatePresence>
        
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden relative">
          <DigitalGrid />
          <Navbar />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <PrivateRoute>
                    <HistoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <Admin />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
