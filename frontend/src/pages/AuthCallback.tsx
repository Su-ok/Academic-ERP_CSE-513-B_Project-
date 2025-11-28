import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useAuth();

  useEffect(() => {
    const finishLogin = async () => {
      const query = new URLSearchParams(window.location.search);
      const token = query.get("token");

      // Store token if provided
      if (token) {
        localStorage.setItem("token", token);
      }

      try {
        // Fetch user info from backend (uses session cookie)
        const userData = await getCurrentUser();
        if (userData && (userData as any).email) {
          setUser(userData as any);
          setIsAuthenticated(true);
          
          // Check if email starts with "finance"
          const email = ((userData as any).email || "").toLowerCase();
          if (email.startsWith("finance")) {
            // Accounts email - go to employee dashboard
            navigate("/employee", { replace: true });
          } else {
            // Non-Accounts email - go to invalid access page
            navigate("/invalid-access", { replace: true });
          }
        } else {
          throw new Error("No user data received");
        }
      } catch (err) {
        console.error("Failed to fetch user after OAuth:", err);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login", { replace: true });
      }
    };

    finishLogin();
  }, [navigate, setIsAuthenticated, setUser]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging you in...</p>
      </div>
    </div>
  );
}

