import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function SqlPlayground() {
  const [query, setQuery] = useState(`SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;`);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "", direction: "asc" });
  const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100];

  useEffect(() => {
    document.title = "SQL Playground — QA Automation Playground";
  }, []);

  const rows: any[] | null = Array.isArray(result) ? result : result?.rows ?? null;

  const headers = useMemo<string[]>(() => {
    if (!rows || rows.length === 0) return [];
    const headerSet = rows.reduce<Set<string>>((set: Set<string>, row: Record<string, unknown>) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set<string>());
    return Array.from(headerSet);
  }, [rows]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (row: any, key: string) => {
    const value = row?.[key];
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return value;
    return String(value).toLowerCase();
  };

  const sortedRows = useMemo<any[]>(() => {
    if (!rows || rows.length === 0) return [];
    const list = [...rows];
    if (!sortConfig.key) return list;
    list.sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.key);
      const bValue = getSortableValue(b, sortConfig.key);
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      const comparison = String(aValue).localeCompare(String(bValue), undefined, { sensitivity: "base" });
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    return list;
  }, [rows, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visibleRows = useMemo<any[]>(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedRows.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedRows]);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  useEffect(() => {
    if (!rows || rows.length === 0) return;
    if (!headers.includes(sortConfig.key)) {
      const fallbackHeader = headers[0] ?? "";
      setSortConfig({ key: fallbackHeader, direction: "asc" });
    }
  }, [headers, rows, sortConfig.key]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const runQuery = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API_ROOT}/sql/run`, { query });
      setResult(res.data || {});
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Query failed");
    }
  };
  function renderTableFromRows(rowsToRender: any[]) {
    if (!rowsToRender || rowsToRender.length === 0) return null;

    return (
      <div className="panel spaced-panel sql-result">
        <h3>Result</h3>
        <div className="sql-result-table-wrap">
          <table className="sql-result-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>
                    <button className="table-sort-button" type="button" onClick={() => handleSort(header)}>
                      {header}
                      <span className="table-sort-indicator">{sortConfig.key === header ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map((row: any, i: number) => (
                <tr key={i}>
                  {headers.map((header) => (
                    <td key={header}>{row && row[header] !== undefined ? String(row[header]) : ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows && rows.length > 0 ? (
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
    );
  }

  return (
    <div className="compact-container">
      <h1>SQL Playground</h1>
      <p className="intro">Run SQL queries against the database.</p>

      <div className="page-card compact spaced-panel">
        <form onSubmit={runQuery} className="form-grid compact-form">
          <label className="field-label">
            SQL
            <textarea className="field-input" rows={6} value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="form-actions">
            <button className="button button--primary" type="submit">Run</button>
            <button className="button button--secondary" type="button" onClick={() => { setQuery(`SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public' AND table_type = 'BASE TABLE'\nORDER BY table_name;`); setResult(null); setError(null); }}>Reset</button>
          </div>
        </form>

        {error ? <p className="error-text spaced-top">{error}</p> : null}

        {rows ? (
          renderTableFromRows(visibleRows)
        ) : (
          <div className="panel spaced-panel">
            <h3>Result</h3>
            <pre className="code-pre">{result ? JSON.stringify(result, null, 2) : 'No results yet.'}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
