import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../services/supabaseClient';

const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>('end user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [roleModalRow, setRoleModalRow] = useState<any | null>(null);
  const [roleSelection, setRoleSelection] = useState<'super admin' | 'admin' | 'end user'>('end user');

  useEffect(() => {
    document.title = 'Admin — QA Playground';

    const loadSession = async () => {
      if (!supabase) {
        setUserEmail(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoadingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email ?? null;
      setUserEmail(email);

      if (email) {
        try {
          const res = await fetch(`${API_ROOT}/admin/auth-users/me`, {
            headers: {
              'x-admin-email': email.toLowerCase()
            }
          });
          if (res.ok) {
            const payload = await res.json();
            setRole(payload.role || 'end user');
            setIsAdmin(Boolean(payload.allowed));
            setIsSuperAdmin(Boolean(payload.is_super_admin));
          } else {
            setRole('end user');
            setIsAdmin(false);
            setIsSuperAdmin(false);
          }
        } catch (fetchError) {
          setRole('end user');
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }

      setLoadingSession(false);
    };

    loadSession();
  }, []);

  useEffect(() => {
    document.title = 'Admin — QA Playground';
  }, []);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const headers: any = {};
      if (userEmail) headers['x-admin-email'] = userEmail.toLowerCase();
      const res = await axios.get(`${API_ROOT}/admin/auth-users`, { headers });
      setRows(res.data.rows || res.data || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  async function makeSuperAdmin(email: string) {
    setError(null);
    setLoading(true);
    try {
      const headers: any = {};
      if (userEmail) headers['x-admin-email'] = userEmail.toLowerCase();
      const res = await axios.post(`${API_ROOT}/admin/auth-users/super-admin`, { email }, { headers });
      setRows(res.data.rows || res.data || null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }

  function openRoleModal(row: any) {
    setRoleModalRow(row);
    const displayRole = getDisplayRole(row);
    setRoleSelection(displayRole === 'super admin' ? 'super admin' : displayRole === 'admin' ? 'admin' : 'end user');
  }

  function closeRoleModal() {
    setRoleModalRow(null);
  }

  async function assignRole(email: string, role: string) {
    setError(null);
    setLoading(true);
    try {
      const headers: any = {};
      if (userEmail) headers['x-admin-email'] = userEmail.toLowerCase();
      const res = await axios.post(`${API_ROOT}/admin/auth-users/role`, { email, role }, { headers });
      setRows(res.data.rows || res.data || null);
      closeRoleModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  }

  const getVisibleColumns = (row: any) =>
    Object.keys(row || {}).filter(
      (key) => !['raw_app_meta_data', 'raw_user_meta_data', 'role', 'is_super_admin'].includes(key)
    );

  const getDisplayRole = (row: any) => {
    if (row?.is_super_admin) return 'super admin';
    if (String(row?.role || '').toLowerCase() === 'admin') return 'admin';
    return 'end user';
  };

  async function deleteUser(userId: number) {
    setError(null);
    setLoading(true);
    try {
      const headers: any = {};
      if (userEmail) headers['x-admin-email'] = userEmail.toLowerCase();
      const res = await axios.delete(`${API_ROOT}/admin/auth-users/${userId}`, { headers });
      setRows((currentRows) => (currentRows || []).filter((row) => row.id !== userId));
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  }

  if (loadingSession) {
    return <div className="page-card compact"><p>Checking permissions…</p></div>;
  }

  if (!userEmail || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="page-card compact">
      <p className="eyebrow">Developer</p>
      <h1>Admin: Auth users</h1>
      <p className="intro">Developer-only view. This page supports end users, admin, and super admin roles via Supabase auth metadata.</p>
      <p className="intro">Current signed-in role: <strong>{role}</strong>{isSuperAdmin ? ' (super admin)' : ''}</p>

      <div className="form-actions">
        <button className="button button--primary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Load users'}</button>
      </div>

      {error ? <p className="error-text spaced-top">{error}</p> : null}

      {rows ? (
        <div className="panel spaced-panel sql-result">
          <table className="sql-result-table">
            <thead>
              <tr>
                {getVisibleColumns(rows[0] || {}).map((h) => (<th key={h}>{h}</th>))}
                <th>Role</th>
                <th>Role Actions</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={i}>
                  {getVisibleColumns(r).map((k) => (<td key={k}>{String(r[k] ?? '')}</td>))}
                  <td>{getDisplayRole(r)}</td>
                  <td>
                    {isSuperAdmin ? (
                      <button className="icon-button" type="button" onClick={() => openRoleModal(r)} disabled={loading} title="Edit role">
                        ✏️
                      </button>
                    ) : (
                      <span>Requires super admin</span>
                    )}
                  </td>
                  <td>
                    {(isSuperAdmin || (String(role).toLowerCase() === 'admin' && getDisplayRole(r) === 'end user')) && !r.is_super_admin ? (
                      <button className="icon-button" type="button" onClick={() => deleteUser(r.id)} disabled={loading} title="Delete user">
                        🗑️
                      </button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="spaced-top">No data loaded.</p>
      )}

      {roleModalRow ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Edit role for {roleModalRow.email}</h2>
            <form onSubmit={(event) => {
              event.preventDefault();
              assignRole(roleModalRow.email, roleSelection);
            }}>
                <label className="field-label">
                <input
                  type="radio"
                  name="role"
                  value="super admin"
                  checked={roleSelection === 'super admin'}
                  onChange={() => setRoleSelection('super admin')}
                />
                Super admin
              </label>
              <label className="field-label">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={roleSelection === 'admin'}
                  onChange={() => setRoleSelection('admin')}
                />
                Admin
              </label>
              <label className="field-label">
                <input
                  type="radio"
                  name="role"
                  value="end user"
                  checked={roleSelection === 'end user'}
                  onChange={() => setRoleSelection('end user')}
                />
                End user
              </label>
              <div className="form-actions">
                <button className="button button--primary" type="submit" disabled={loading}>
                  Save role
                </button>
                <button className="button button--secondary" type="button" onClick={closeRoleModal} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
