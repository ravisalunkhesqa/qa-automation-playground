import { useEffect, useState } from "react";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function SqlPlayground() {
  const [query, setQuery] = useState(`SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;`);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "SQL Playground — QA Automation Playground";
  }, []);

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
  function renderTableFromRows(rows: any[]) {
    if (!rows || rows.length === 0) return null
    const headers: string[] = Array.from(
      rows.reduce((set, r) => {
        Object.keys(r || {}).forEach((k) => set.add(k))
        return set
      }, new Set<string>())
    )

    return (
      <div className="panel spaced-panel sql-result">
        <h3>Result</h3>
        <div className="sql-result-table-wrap">
          <table className="sql-result-table">
            <thead>
              <tr>
                {headers.map((h: string) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i: number) => (
                <tr key={i}>
                  {headers.map((h: string) => (
                    <td key={h}>{row && row[h] !== undefined ? String(row[h]) : ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const rows = Array.isArray(result) ? result : result?.rows ?? null

  return (
    <div className="compact-container">
      <h1>SQL Playground</h1>
      <p className="intro">Run ad-hoc SQL queries against the local backend (development only).</p>

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
          renderTableFromRows(rows)
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
