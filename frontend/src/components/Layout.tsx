import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Layout() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) return;

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email ?? null;
      setUserEmail(email);

      if (email) {
        try {
          const res = await fetch(`${API_ROOT}/admin/auth-users/me`, {
            headers: {
              'x-admin-email': (email as string).toLowerCase()
            }
          });
          if (res.ok) {
            const payload = await res.json();
            setIsAdmin(Boolean(payload.allowed));
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };

    loadSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange((_, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      if (email) {
        fetch(`${API_ROOT}/admin/auth-users/me`, {
          headers: {
            'x-admin-email': (email as string).toLowerCase()
          }
        })
          .then((res) => res.ok ? res.json() : Promise.reject(res))
          .then((payload) => {
            setIsAdmin(Boolean(payload.allowed));
          })
          .catch(() => {
            setIsAdmin(false);
          });
      } else {
        setIsAdmin(false);
      }
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
      <header className="app-header compact">
        <div className="brand-row">
          <div>
            <Link to="/" className="brand-logo">
              QA Automation Playground
            </Link>
            <p className="brand-tagline compact">A modern playground for auth, CRUD, and API exploration.</p>
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
      </header>

      <div className="app-nav-wrap">
        <nav className="app-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
          {!userEmail && <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Login</NavLink>}
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>CRUD</NavLink>
          <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Employees</NavLink>
          <NavLink to="/widgets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Widgets</NavLink>
          <NavLink to="/api" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>API</NavLink>
          <NavLink to="/sql" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>SQL</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>}
        </nav>
      </div>

      <main className="page-shell compact">
        <Outlet />
      </main>
    </div>
  );
}
