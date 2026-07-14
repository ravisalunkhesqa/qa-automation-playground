import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseStatus, supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const [supabaseStatus] = useState(getSupabaseStatus());
  const [authMessage, setAuthMessage] = useState<string>("Checking auth...");
  const [userEmail, setUserEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setAuthMessage("Backend client not configured");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuthMessage("Signed in");
        setUserEmail(session.user.email || "unknown");
      } else {
        setAuthMessage("Not signed in");
        setUserEmail("");
      }
    };

    checkSession();
  }, []);

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleSignOut = async () => {
    if (!supabase) {
      setAuthMessage("Backend client not configured");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthMessage(`Sign-out failed: ${error.message}`);
    } else {
      setAuthMessage("Signed out");
      setUserEmail("");
    }
  };

  return (
    <div className="page-card page-card--hero">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>QA Automation Playground</h1>
          <p className="intro">
            Compact status insights for backend auth state and playground access.
          </p>
        </div>
        <div className="panel">
          <div className="status-grid">
            <div>
              <span>Backend configured</span>
              <strong>{supabaseStatus.configured ? "Yes" : "No"}</strong>
            </div>
            
{/*             <div>
              <span>Publishable key</span>
              <strong>{supabaseStatus.publishableKey ? "Yes" : "No"}</strong>
            </div> */}
            <div>
              <span>Auth status</span>
              <strong>{authMessage}</strong>
            </div>
            <div>
              <span>Signed in user</span>
              <strong>{userEmail || "None"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        {!userEmail ? (
          <button className="button button--primary" onClick={handleGoToLogin}>
            Go to login
          </button>
        ) : (
          <button className="button button--secondary" onClick={handleSignOut}>
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}