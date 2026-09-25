import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { Zap, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAdmin = () => {
    setEmail('admin@servicehub.com');
    setPassword('admin123');
  };

  const setDemoEmployee = () => {
    setEmail('tech@servicehub.com');
    setPassword('employee123');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

      {/* Top Header Branding */}
      <header className="flex items-center justify-between border-b-3 border-black pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FFD600] border-2 border-black brutal-shadow-sm">
            <Zap className="w-7 h-7 text-black fill-black" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-heading tracking-tight text-black">
              SERVICEHUB
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
              SERVICE REQUESTS. ASSIGNED. TRACKED. COMPLETED.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="w-3 h-3 bg-[#B7FF00] border border-black inline-block" />
          <span className="text-xs font-black uppercase tracking-wider">SYSTEM v1.0 ONLINE</span>
        </div>
      </header>

      {/* Main Grid Section */}
      <main className="my-auto py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        {/* Left Editorial Section */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="inline-block bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-widest self-start">
            ENTERPRISE SaaS SYSTEM
          </div>
          <h2 className="text-4xl sm:text-6xl xl:text-7xl font-black font-heading tracking-tighter leading-[0.95] text-black">
            SERVICE MANAGEMENT <br />
            <span className="bg-[#FFD600] px-2 py-0.5 border-3 border-black inline-block mt-2 brutal-shadow">
              WITHOUT THE CHAOS.
            </span>
          </h2>
          <p className="text-base sm:text-lg font-semibold text-neutral-800 max-w-xl leading-snug">
            Streamline service requests, automate employee assignments, track real-time lifecycle progression, and analyze operational metrics with high-contrast brutalist efficiency.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mt-2">
            <div className="brutal-card p-3 bg-white">
              <span className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                ⚡ REAL-TIME LIFECYCLE
              </span>
              <span className="text-xs font-medium text-neutral-600">Pending to Completed tracking</span>
            </div>
            <div className="brutal-card p-3 bg-white">
              <span className="text-xs font-black uppercase tracking-wider text-black block mb-1">
                🔒 RBAC SECURITY
              </span>
              <span className="text-xs font-medium text-neutral-600">Admin & Employee permissions</span>
            </div>
          </div>
        </div>

        {/* Right Login Box */}
        <div className="lg:col-span-5 w-full">
          <div className="brutal-card bg-white p-6 sm:p-8 brutal-shadow-lg relative">
            <div className="bg-black text-white px-4 py-2 text-xs font-black uppercase tracking-widest mb-6 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 border-b-3 border-black flex justify-between items-center">
              <span>AUTHENTICATION PORTAL</span>
              <span className="text-[#FFD600]">REST API JWT</span>
            </div>

            <h3 className="text-2xl font-black uppercase font-heading text-black mb-1">SYSTEM LOGIN</h3>
            <p className="text-xs font-bold text-neutral-600 uppercase mb-6">Enter authorized credentials to continue</p>

            {error && (
              <div className="mb-6 brutal-card bg-[#FF3B30] text-white p-3 text-xs font-bold flex items-center gap-2 border-2 border-black">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="EMAIL ADDRESS"
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="PASSWORD"
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="yellow"
                size="lg"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? 'AUTHENTICATING...' : 'ENTER SYSTEM →'}
              </Button>
            </form>

            {/* Quick Demo Login Credentials Bar */}
            <div className="mt-8 pt-4 border-t-2 border-black">
              <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest block mb-2">
                QUICK DEMO CREDENTIALS:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={setDemoAdmin}
                  className="px-2 py-1.5 border-2 border-black bg-neutral-100 hover:bg-[#FF3B30] hover:text-white text-[11px] font-extrabold uppercase transition-colors flex items-center justify-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DEMO ADMIN</span>
                </button>
                <button
                  type="button"
                  onClick={setDemoEmployee}
                  className="px-2 py-1.5 border-2 border-black bg-neutral-100 hover:bg-[#0057FF] hover:text-white text-[11px] font-extrabold uppercase transition-colors flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>DEMO EMPLOYEE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="border-t-3 border-black pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 text-xs font-bold text-neutral-600 uppercase">
        <div>SERVICEHUB PLATFORM &copy; 2026. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-4">
          <span className="hover:underline cursor-pointer">FASTAPI BACKEND</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">POSTGRESQL DB</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">REACT FRONTEND</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;
