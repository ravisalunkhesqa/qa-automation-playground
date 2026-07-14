import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createPlaygroundItem, deletePlaygroundItem, listPlaygroundItems, updatePlaygroundItem } from "../services/supabaseTable";

type Item = {
  id: number;
  name: string;
  description: string;
};

export default function UserManagement() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadItems = async () => {
    try {
      const data = await listPlaygroundItems();
      setItems(data as Item[]);
      setMessage("");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Unable to load items. ${detail}`);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updatePlaygroundItem(editingId, form);
      } else {
        await createPlaygroundItem(form);
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      await loadItems();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Save failed. ${detail}`);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description });
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlaygroundItem(id);
      await loadItems();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setMessage(`Delete failed. ${detail}`);
    }
  };

  return (
    <div className="page-card">
      <div className="stack">
        <p className="eyebrow">Data CRUD</p>
        <h1>Manage playground items</h1>
        <p className="intro">
          Create, update, and delete rows in the <code>playground_items</code> table.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-grid compact-form">
        <label className="field-label">
          Name
          <input
            className="field-input"
            placeholder="Item name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>

        <label className="field-label">
          Description
          <input
            className="field-input"
            placeholder="Item description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            required
          />
        </label>

        <div className="form-actions">
          <button className="button button--primary" type="submit">
            {editingId ? "Update item" : "Add item"}
          </button>
          {editingId ? (
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: "", description: "" });
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {message ? <p className="message">{message}</p> : null}

      <div className="panel">
        <table className="items-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                  <button className="icon-button" type="button" onClick={() => handleEdit(item)} title="Edit item">
                    ✏️
                  </button>
                </td>
                <td>
                  <button className="icon-button" type="button" onClick={() => handleDelete(item.id)} title="Delete item">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
