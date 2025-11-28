import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth() as any;

  useEffect(() => {
    document.title = "Academic ERP - Login";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Check if user has accounts email before redirecting
      const email = (user?.email || "").toLowerCase();
      if (email.startsWith("finance")) {
        navigate("/employee", { replace: true });
      } else {
        // Non-accounts user should go to invalid access page
        navigate("/invalid-access", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleLogin = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-cyan-50 to-teal-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="https://www.iiitb.ac.in/includefiles/userfiles/images/iiitb_logo.png"
            className="h-20 mx-auto mb-6"
            alt="IIITB Logo"
          />
          <h1 className="text-4xl font-semibold text-slate-500 mb-2">
            Academic ERP
          </h1>
          <p className="text-lg text-slate-400">
            Employee Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-lg w-full border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-500 mb-3">
              Sign In
            </h2>
            <p className="text-slate-400 text-sm">
              Use your Google account to access the portal
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-sky-300 transition-all shadow-sm font-semibold text-white hover:shadow-md"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-300">
              By signing in, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

