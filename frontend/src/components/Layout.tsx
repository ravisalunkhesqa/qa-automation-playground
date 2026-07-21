import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function Layout() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLabel, setRoleLabel] = useState("User");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
            const isAllowed = Boolean(payload.allowed);
            const isSuperAdmin = Boolean(payload.is_super_admin);
            setIsAdmin(isAllowed);
            if (isSuperAdmin) {
              setRoleLabel("Super Admin");
            } else if (isAllowed) {
              setRoleLabel("Admin");
            } else {
              setRoleLabel("User");
            }
          } else {
            setIsAdmin(false);
            setRoleLabel("User");
          }
        } catch (error) {
          setIsAdmin(false);
          setRoleLabel("User");
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
            const isAllowed = Boolean(payload.allowed);
            const isSuperAdmin = Boolean(payload.is_super_admin);
            setIsAdmin(isAllowed);
            if (isSuperAdmin) {
              setRoleLabel("Super Admin");
            } else if (isAllowed) {
              setRoleLabel("Admin");
            } else {
              setRoleLabel("User");
            }
          })
          .catch(() => {
            setIsAdmin(false);
            setRoleLabel("User");
          });
      } else {
        setIsAdmin(false);
        setRoleLabel("User");
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
    setRoleLabel("User");
    setShowProfileMenu(false);
    navigate("/");
  };

  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);

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
              <div className="profile-menu">
                <button
                  type="button"
                  className="profile-trigger"
                  onClick={() => setShowProfileMenu((value) => !value)}
                  aria-expanded={showProfileMenu}
                >
                  <span className="profile-avatar">{(userEmail || "U").charAt(0).toUpperCase()}</span>
                </button>

                {showProfileMenu ? (
                  <div className="profile-dropdown">
                    <div className="profile-email">{userEmail}</div>
                    <div className="profile-role">{roleLabel}</div>
                    <button type="button" className="link-button signout-link" onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                ) : null}
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
          <NavLink to="/widgets" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Widgets</NavLink>
          <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Employee</NavLink>
          <NavLink to="/api" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>API</NavLink>
          <NavLink to="/sql" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>SQL</NavLink>
          <NavLink to="/repositories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Repository</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>}

        </nav>
      </div>

      <main className="page-shell compact">
        <Outlet />
      </main>
    </div>
  );
}
