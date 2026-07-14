import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type Item = {
  id: number;
  name: string;
  description: string;
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const methods: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export default function ApiPlayground() {
  const [items, setItems] = useState<Item[]>([]);
  const [requestId, setRequestId] = useState<string>("");
  const [method, setMethod] = useState<Method>("GET");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const loadItems = async () => {
    try {
      const result = await axios.get<Item[]>(`${API_ROOT}/users`);
      setItems(result.data || []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Unable to load items.");
      console.error(error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const buildRequestPayload = () => {
    const payload: Record<string, string> = {};
    if (name.trim().length > 0) payload.name = name.trim();
    if (description.trim().length > 0) payload.description = description.trim();
    return payload;
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

      switch (method) {
        case "GET":
          result = await axios.get(`${API_ROOT}/users${idPath}`);
          break;
        case "POST":
          result = await axios.post(`${API_ROOT}/users`, payload);
          break;
        case "PUT":
          if (!hasId) throw new Error("Item ID is required for PUT.");
          result = await axios.put(`${API_ROOT}/users${idPath}`, payload);
          break;
        case "PATCH":
          if (!hasId) throw new Error("Item ID is required for PATCH.");
          result = await axios.patch(`${API_ROOT}/users${idPath}`, payload);
          break;
        case "DELETE":
          if (!hasId) throw new Error("Item ID is required for DELETE.");
          result = await axios.delete(`${API_ROOT}/users${idPath}`);
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
    setRequestId(String(item.id));
    setName(item.name);
    setDescription(item.description);
    setErrorMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>API Playground</h1>

      <div className="page-card" style={{ maxWidth: "980px", marginTop: "20px" }}>
        <div className="stack" style={{ gap: "8px" }}>
          <p className="eyebrow">HTTP methods</p>
          <h2>Playground request runner</h2>
          <p className="intro">
            Execute and inspect GET, POST, PUT, PATCH, and DELETE requests against the local API.
          </p>
        </div>

        <div className="method-tabs" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
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

        <form onSubmit={sendRequest} className="form-grid compact-form" style={{ gap: "16px", marginTop: "20px" }}>
          <label className="field-label">
            Request path
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span>/api/users</span>
              <input
                className="field-input"
                placeholder="Optional item id"
                value={requestId}
                onChange={(event) => setRequestId(event.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </label>

          {method !== "GET" && method !== "DELETE" ? (
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
          ) : null}

          <div className="form-actions" style={{ gap: "12px", alignItems: "center" }}>
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

        {errorMessage ? <p style={{ color: "crimson", marginTop: "8px" }}>{errorMessage}</p> : null}

        <div className="panel" style={{ marginTop: "20px" }}>
          <h3>Request preview</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {`${method} ${API_ROOT}/users${requestId.trim() ? `/${requestId.trim()}` : ""}`}
            {method !== "GET" && method !== "DELETE" ? `\nBody: ${JSON.stringify(buildRequestPayload(), null, 2)}` : ""}
          </pre>
        </div>

        <div className="panel" style={{ marginTop: "20px" }}>
          <h3>Response</h3>
          <p>Status: {responseStatus ?? "n/a"}</p>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {response ? JSON.stringify(response, null, 2) : "No response yet."}
          </pre>
        </div>

        <div className="panel" style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Stored items</h3>
            <button className="button button--secondary" type="button" onClick={loadItems}>
              Refresh list
            </button>
          </div>
          <table className="items-table" style={{ width: "100%", marginTop: "12px" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>
                    <button className="button button--secondary" type="button" onClick={() => handleFillForEdit(item)}>
                      Edit in request
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}