import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type Item = {
  id?: number;
  name?: string;
  description?: string;
  employeeId?: number;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  employmentStatus?: string;
  department?: { departmentId?: number; departmentName?: string };
  jobTitle?: { jobTitleId?: number; jobTitleName?: string };
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type PlaygroundMode = "legacy" | "hrms";

const methods: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const modes: PlaygroundMode[] = ["legacy", "hrms"];

export default function ApiPlayground() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<PlaygroundMode>("hrms");
  const [requestId, setRequestId] = useState<string>("");
  const [method, setMethod] = useState<Method>("GET");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Permanent");
  const [departmentId, setDepartmentId] = useState("1");
  const [jobTitleId, setJobTitleId] = useState("1");
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "employeeId", direction: "asc" });
  const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100];

  const loadItems = async () => {
    try {
      const endpoint = mode === "legacy" ? `${API_ROOT}/users` : `${API_ROOT}/employees`;
      const result = await axios.get(endpoint);
      const payload = mode === "legacy" ? result.data || [] : (result.data?.items || result.data || []);
      setItems(payload);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Unable to load items.");
      console.error(error);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (item: Item, key: string) => {
    switch (key) {
      case "id":
        return item.id ?? -1;
      case "name":
        return item.name?.toLowerCase() ?? "";
      case "description":
        return item.description?.toLowerCase() ?? "";
      case "employeeId":
        return item.employeeId ?? -1;
      case "employeeCode":
        return item.employeeCode?.toLowerCase() ?? "";
      case "firstName":
        return item.firstName?.toLowerCase() ?? "";
      case "lastName":
        return item.lastName?.toLowerCase() ?? "";
      case "username":
        return item.username?.toLowerCase() ?? "";
      case "email":
        return item.email?.toLowerCase() ?? "";
      case "status":
        return (item.employmentStatus || "").toLowerCase();
      case "department":
        return item.department?.departmentName?.toLowerCase() ?? "";
      case "jobTitle":
        return item.jobTitle?.jobTitleName?.toLowerCase() ?? "";
      default:
        return "";
    }
  };

  const sortedItems = useMemo(() => {
    const list = [...items];
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
  }, [items, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const visibleItems = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedItems]);

  useEffect(() => {
    setPage(1);
    setSortConfig({ key: mode === "legacy" ? "id" : "employeeId", direction: "asc" });
    loadItems();
  }, [mode]);

  useEffect(() => {
    setRequestId("");
    setName("");
    setDescription("");
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setEmploymentStatus("Permanent");
    setDepartmentId("1");
    setJobTitleId("1");
  }, [mode]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    document.title = "API Playground — QA Automation Playground";
  }, []);

  const buildRequestPayload = () => {
    if (mode === "legacy") {
      const payload: Record<string, string> = {};
      if (name.trim().length > 0) payload.name = name.trim();
      if (description.trim().length > 0) payload.description = description.trim();
      return payload;
    }

    const payload: Record<string, string | number | boolean | undefined> = {
      employeeCode: employeeCode.trim() || undefined,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      username: username.trim() || undefined,
      email: email.trim() || undefined,
      employmentStatus: employmentStatus || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      jobTitleId: jobTitleId ? Number(jobTitleId) : undefined,
    };

    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
  };

  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setResponse(null);
    setResponseStatus(null);

    try {
      const hasId = requestId.trim().length > 0;
      const idPath = hasId ? `/${encodeURIComponent(requestId.trim())}` : "";
      const payload = buildRequestPayload();
      let result;

      const basePath = mode === "legacy" ? "/users" : "/employees";

      switch (method) {
        case "GET":
          result = await axios.get(`${API_ROOT}${basePath}${idPath}`);
          break;
        case "POST":
          result = await axios.post(`${API_ROOT}${basePath}`, payload);
          break;
        case "PUT":
          if (!hasId) throw new Error("Item ID is required for PUT.");
          result = await axios.put(`${API_ROOT}${basePath}${idPath}`, payload);
          break;
        case "PATCH":
          if (!hasId) throw new Error("Item ID is required for PATCH.");
          result = await axios.patch(`${API_ROOT}${basePath}${idPath}`, payload);
          break;
        case "DELETE":
          if (!hasId) throw new Error("Item ID is required for DELETE.");
          result = await axios.delete(`${API_ROOT}${basePath}${idPath}`);
          break;
        default:
          throw new Error("Unsupported method.");
      }

      setResponse(result.data ?? { status: "success" });
      setResponseStatus(result.status);
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        await loadItems();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed.";
      setErrorMessage(message);
      console.error(error);
      if (error && typeof error === "object" && "response" in error) {
        const err: any = error;
        setResponse(err.response?.data || null);
        setResponseStatus(err.response?.status || null);
      }
    }
  };

  const handleFillForEdit = (item: Item) => {
    setMethod("PUT");
    setRequestId(String(mode === "legacy" ? item.id : item.employeeId));
    if (mode === "legacy") {
      setName(item.name || "");
      setDescription(item.description || "");
    } else {
      setEmployeeCode(item.employeeCode || "");
      setFirstName(item.firstName || "");
      setLastName(item.lastName || "");
      setUsername(item.username || "");
      setEmail(item.email || "");
      setEmploymentStatus(item.employmentStatus || "Permanent");
      setDepartmentId(item.department?.departmentId ? String(item.department.departmentId) : "1");
      setJobTitleId(item.jobTitle?.jobTitleId ? String(item.jobTitle.jobTitleId) : "1");
    }
    setErrorMessage("");
  };

  return (
    <div className="compact-container">
      <h1>API Playground</h1>

      <div className="page-card compact centered-card-wide spaced-panel">
        <div className="stack">
          <p className="eyebrow">HTTP methods</p>
          <h2>Playground for API request runner</h2>
          <p className="intro">
            Execute and inspect GET, POST, PUT, PATCH, and DELETE requests against the API.
          </p>
        </div>
        <div className="method-tabs spaced-top">
          {modes.map((value) => (
            <button
              key={value}
              type="button"
              className={mode === value ? "button button--primary" : "button button--secondary"}
              onClick={() => setMode(value)}
            >
              {value === "legacy" ? "Legacy CRUD" : "HRMS Employees"}
            </button>
          ))}
        </div>

        <div className="method-tabs">
          {methods.map((value) => (
            <button
              key={value}
              type="button"
              className={method === value ? "button button--primary" : "button button--secondary"}
              onClick={() => setMethod(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <form onSubmit={sendRequest} className="form-grid compact-form spaced-top" >
          <label className="field-label">
            Request path
            <div className="request-path">
              <span>{mode === "legacy" ? "/api/users" : "/api/employees"}</span>
              <input
                className="field-input"
                placeholder="Optional item id"
                value={requestId}
                onChange={(event) => setRequestId(event.target.value)}
              />
            </div>
          </label>

          {method !== "GET" && method !== "DELETE" ? (
            <>
              {mode === "legacy" ? (
                <>
                  <label className="field-label">
                    Name
                    <input
                      className="field-input"
                      placeholder="Item name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Description
                    <input
                      className="field-input"
                      placeholder="Item description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="field-label">
                    Employee code
                    <input
                      className="field-input"
                      placeholder="EMP001"
                      value={employeeCode}
                      onChange={(event) => setEmployeeCode(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    First name
                    <input
                      className="field-input"
                      placeholder="First name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Last name
                    <input
                      className="field-input"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Username
                    <input
                      className="field-input"
                      placeholder="Username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Email
                    <input
                      className="field-input"
                      placeholder="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>

                  <label className="field-label">
                    Employment status
                    <select className="field-input" value={employmentStatus} onChange={(event) => setEmploymentStatus(event.target.value)}>
                      <option value="Permanent">Permanent</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </label>

                  <label className="field-label">
                    Department
                    <select className="field-input" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                      <option value="1">Engineering</option>
                      <option value="2">QA</option>
                      <option value="3">HR</option>
                      <option value="4">Finance</option>
                    </select>
                  </label>

                  <label className="field-label">
                    Job title
                    <select className="field-input" value={jobTitleId} onChange={(event) => setJobTitleId(event.target.value)}>
                      <option value="1">Test Engineer</option>
                      <option value="2">Senior Test Engineer</option>
                      <option value="3">Automation Architect</option>
                      <option value="4">Software Developer</option>
                      <option value="5">HR Executive</option>
                    </select>
                  </label>
                </>
              )}
            </>
          ) : null}

          <div className="form-actions">
            <button className="button button--primary" type="submit">
              Send request
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setRequestId("");
                setName("");
                setDescription("");
                setResponse(null);
                setResponseStatus(null);
                setErrorMessage("");
              }}
            >
              Clear
            </button>
            <button className="button button--secondary" type="button" onClick={loadItems}>
              Refresh items
            </button>
          </div>
        </form>

        {errorMessage ? <p className="error-text spaced-top">{errorMessage}</p> : null}

        <div className="panel spaced-panel">
          <h3>Request preview</h3>
          <pre className="code-pre">
            {`${method} ${API_ROOT}${mode === "legacy" ? "/users" : "/employees"}${requestId.trim() ? `/${requestId.trim()}` : ""}`}
            {method !== "GET" && method !== "DELETE" ? `\nBody: ${JSON.stringify(buildRequestPayload(), null, 2)}` : ""}
          </pre>
        </div>
        <div className="panel spaced-panel">
          <h3>Response</h3>
          <p>Status: {responseStatus ?? "n/a"}</p>
          <pre className="code-pre">
            {response ? JSON.stringify(response, null, 2) : "No response yet."}
          </pre>
        </div>
        <div className="panel spaced-panel">
          <div className="panel-row">
            <h3>{mode === "legacy" ? "Stored items" : "Employees"}</h3>
            <button className="button button--secondary" type="button" onClick={loadItems}>
              Refresh list
            </button>
          </div>
          <table className="items-table spaced-top">
            <thead>
              {mode === "legacy" ? (
                <tr>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("id")}>ID <span className="table-sort-indicator">{sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("name")}>Name <span className="table-sort-indicator">{sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("description")}>Description <span className="table-sort-indicator">{sortConfig.key === "description" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th>Action</th>
                </tr>
              ) : (
                <tr>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("employeeId")}>ID <span className="table-sort-indicator">{sortConfig.key === "employeeId" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("employeeCode")}>Code <span className="table-sort-indicator">{sortConfig.key === "employeeCode" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("name")}>Name <span className="table-sort-indicator">{sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("username")}>Username <span className="table-sort-indicator">{sortConfig.key === "username" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("email")}>Email <span className="table-sort-indicator">{sortConfig.key === "email" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("status")}>Status <span className="table-sort-indicator">{sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("department")}>Department <span className="table-sort-indicator">{sortConfig.key === "department" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("jobTitle")}>Job title <span className="table-sort-indicator">{sortConfig.key === "jobTitle" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {visibleItems.map((item, index) => (
                <tr key={item.id ?? item.employeeId ?? index}>
                  {mode === "legacy" ? (
                    <>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.description}</td>
                      <td>
                        <button className="button button--secondary" type="button" onClick={() => handleFillForEdit(item)}>
                          Edit in request
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.employeeId}</td>
                      <td>{item.employeeCode}</td>
                      <td>{item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : "-"}</td>
                      <td>{item.username || "-"}</td>
                      <td>{item.email || "-"}</td>
                      <td>{item.employmentStatus || "-"}</td>
                      <td>{item.department?.departmentName || "-"}</td>
                      <td>{item.jobTitle?.jobTitleName || "-"}</td>
                      <td>
                        <button className="button button--secondary" type="button" onClick={() => handleFillForEdit(item)}>
                          Load ID
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 0 ? (
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
                <span className="table-summary">Showing {Math.min((page - 1) * pageSize + 1, sortedItems.length)}-{Math.min(page * pageSize, sortedItems.length)} of {sortedItems.length}</span>
              </div>
              <div className="pagination-controls">
                <button className="button button--secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button className="button button--secondary" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}