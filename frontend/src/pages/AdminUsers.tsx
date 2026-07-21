import { useEffect, useMemo, useState } from 'react';
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'email', direction: 'asc' });
  const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100];

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
    setPage(1);
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil((rows?.length || 0) / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

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
      await axios.post(`${API_ROOT}/admin/auth-users/role`, { email, role }, { headers });
      await load();
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

  const visibleColumns = useMemo(() => {
    if (!rows?.length) return [] as string[];
    return getVisibleColumns(rows[0]);
  }, [rows]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortableValue = (row: any, key: string) => {
    if (key === 'role') return getDisplayRole(row);
    const value = row?.[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    return String(value).toLowerCase();
  };

  const sortedRows = useMemo(() => {
    const list = [...(rows || [])];
    list.sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.key);
      const bValue = getSortableValue(b, sortConfig.key);
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const comparison = String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    return list;
  }, [rows, sortConfig]);

  const visibleRows = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedRows]);

  const getDisplayRole = (row: any) => {
    if (row?.is_super_admin) return 'super admin';
    const metadataRole = String(row?.raw_user_meta_data?.role || '').toLowerCase();
    if (metadataRole === 'admin') return 'admin';
    if (String(row?.role || '').toLowerCase() === 'admin') return 'admin';
    return 'end user';
  };

  async function deleteUser(userId: number) {
    setError(null);
    setLoading(true);
    try {
      const headers: any = {};
      if (userEmail) headers['x-admin-email'] = userEmail.toLowerCase();
      await axios.delete(`${API_ROOT}/admin/auth-users/${userId}`, { headers });
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

      <h1>Admin: Users</h1>
  
      <div className="form-actions">
        <button className="button button--primary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Load users'}</button>
      </div>

      {error ? <p className="error-text spaced-top">{error}</p> : null}

      {rows ? (
        <div className="panel spaced-panel sql-result">
          <table className="sql-result-table">
            <thead>
              <tr>
                {visibleColumns.map((h) => (
                  <th key={h}>
                    <button className="table-sort-button" type="button" onClick={() => handleSort(h)}>
                      {h}
                      <span className="table-sort-indicator">{sortConfig.key === h ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  </th>
                ))}
                <th>
                  <button className="table-sort-button" type="button" onClick={() => handleSort('role')}>
                    Role
                    <span className="table-sort-indicator">{sortConfig.key === 'role' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                  </button>
                </th>
                {isSuperAdmin && <th>Assign Role</th>}
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r: any, i: number) => (
                <tr key={i}>
                  {visibleColumns.map((k) => (<td key={k}>{String(r[k] ?? '')}</td>))}
                  <td>{getDisplayRole(r)}</td>
                  {isSuperAdmin ? (
                    <td>
                      <button className="icon-button" type="button" onClick={() => openRoleModal(r)} disabled={loading} title="Edit role">
                        ✏️
                      </button>
                    </td>
                  ) : null}
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
          {rows.length > 0 ? (
            <div className="table-footer">
              <div className="table-footer__controls">
                <label className="table-page-size">
                  <span>Rows</span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
                <span className="table-summary">Showing {Math.min((page - 1) * pageSize + 1, sortedRows.length)}-{Math.min(page * pageSize, sortedRows.length)} of {sortedRows.length}</span>
              </div>
              <div className="pagination-controls">
                <button className="button button--secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button className="button button--secondary" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
              </div>
            </div>
          ) : null}
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
