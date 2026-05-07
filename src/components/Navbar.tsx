import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { LogOut, User as UserIcon, CreditCard, Database, Wifi, WifiOff, Menu, X, Shield, Activity, Clock as ClockIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Ping API every 10 seconds to check server health
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health', { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
        setIsOnline(res.ok);
        // Expose to window so other components can use without a complex context
        (window as any).__APP_IS_ONLINE__ = res.ok;
      } catch (e) {
        setIsOnline(false);
        (window as any).__APP_IS_ONLINE__ = false;
      }
    }, 10000);

    // Initial check
    (async () => {
      try {
        const res = await fetch('/api/health');
        setIsOnline(res.ok);
        (window as any).__APP_IS_ONLINE__ = res.ok;
      } catch (e) {
        setIsOnline(false);
        (window as any).__APP_IS_ONLINE__ = false;
      }
    })();

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bento-card sticky top-0 z-50 rounded-none border-x-0 border-t-0 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                <CreditCard className="h-6 w-6 text-indigo-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Neural<span className="text-indigo-400">Credit_</span>
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 text-[10px] font-mono text-slate-500">
                  <ClockIcon className="h-3 w-3 text-indigo-400" />
                  <span className="tabular-nums tracking-widest">{time}</span>
                </div>

                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'}`}>
                  {isOnline ? <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : <WifiOff className="h-3 w-3" />}
                  <span className="tracking-tighter">{isOnline ? 'SIGNAL_STABLE' : 'NODE_OFFLINE'}</span>
                </div>

                <Link to="/history" className={`flex items-center space-x-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${location.pathname === '/history' ? 'nav-link-active' : 'text-slate-500 hover:text-slate-200'}`}>
                  <Database className="h-3.5 w-3.5" />
                  <span>Logs</span>
                </Link>

                <Link to="/admin" className={`flex items-center space-x-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${location.pathname === '/admin' ? 'nav-link-active' : 'text-slate-500 hover:text-slate-200'}`}>
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </Link>

                <div className="flex items-center space-x-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-bold font-mono tracking-tighter">{user.username.toUpperCase()}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-rose-500/20"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Exit</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {user ? (
                <>
                  <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'}`}>
                    {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                    <span>{isOnline ? 'SYSTEM ONLINE' : 'NODE OFFLINE'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-300 bg-white/5 px-4 py-3 rounded-lg border border-white/5">
                    <UserIcon className="h-5 w-5 text-indigo-400" />
                    <span className="text-sm font-medium">{user.username}</span>
                  </div>

                  <Link
                    to="/history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 border border-transparent transition-colors"
                  >
                    <Database className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">System Logs</span>
                  </Link>

                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 border border-transparent transition-colors"
                  >
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">Enterprise Admin</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-3 rounded-lg font-medium transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center bg-white/5 hover:bg-white/10 text-slate-200 py-3 rounded-lg font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-medium transition-colors text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
