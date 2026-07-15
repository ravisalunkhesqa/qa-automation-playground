import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Layout() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };

    loadSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user?.email ?? null);
    }) ?? { data: null };

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserEmail(null);
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-row">
          <div>
            <Link to="/" className="brand-logo">
              QA Automation Playground
            </Link>
            <p className="brand-tagline">A modern playground for auth, CRUD, and API exploration.</p>
          </div>

          <div className="user-panel">
            {userEmail ? (
              <div className="user-chip">
                <span>{userEmail}</span>
                <button className="link-button signout-link" onClick={handleSignOut}>
                  Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-cta">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="app-nav">
          <Link to="/">Dashboard</Link>
          {!userEmail && <Link to="/login">Login</Link>}
          <Link to="/users">CRUD</Link>
          <Link to="/widgets">Widgets</Link>
          <Link to="/api">API</Link>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}
