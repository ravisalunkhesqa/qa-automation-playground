import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type Employee = {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender?: string;
  phone?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  employmentStatus?: string;
  salary?: number;
  department?: { departmentId?: number; departmentName?: string };
  jobTitle?: { jobTitleId?: number; jobTitleName?: string };
  supervisor?: { employeeId?: number };
  isActive?: boolean;
  isManager?: boolean;
  isRemoteWorker?: boolean;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const createEmptyForm = () => ({
    employeeCode: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    gender: "Female",
    phone: "",
    dateOfBirth: "",
    dateOfJoining: "",
    employmentStatus: "Permanent",
    salary: "",
    departmentId: "1",
    jobTitleId: "2",
    supervisorId: "",
    isActive: true,
    isManager: false,
    isRemoteWorker: false,
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "USA",
      zipcode: "",
    },
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "employeeId", direction: "asc" });
  const pageSizeOptions = [5, 10, 15, 20, 25, 50, 100];

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortableValue = (employee: Employee, key: string) => {
    switch (key) {
      case "employeeId":
        return employee.employeeId;
      case "employeeCode":
        return employee.employeeCode?.toLowerCase() ?? "";
      case "name":
        return `${employee.firstName} ${employee.lastName}`.toLowerCase();
      case "username":
        return employee.username?.toLowerCase() ?? "";
      case "email":
        return employee.email?.toLowerCase() ?? "";
      case "status":
        return (employee.employmentStatus || "").toLowerCase();
      case "department":
        return employee.department?.departmentName?.toLowerCase() ?? "";
      case "jobTitle":
        return employee.jobTitle?.jobTitleName?.toLowerCase() ?? "";
      default:
        return "";
    }
  };

  const sortedEmployees = useMemo(() => {
    const list = [...employees];
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
  }, [employees, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const visibleEmployees = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [page, pageSize, sortedEmployees]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("name", searchTerm.trim());
      if (department) params.set("department", department);
      if (status) params.set("status", status);
      const query = params.toString();
      const result = await axios.get(`${API_ROOT}/employees${query ? `?${query}` : ""}`);
      setEmployees(result.data?.items || []);
      setPage(1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Unable to load employees.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setDepartment("");
    setStatus("");
    await loadEmployees();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setForm(createEmptyForm());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setForm(createEmptyForm());
  };

  const handleCreateEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // client-side validation
    const clientErrors: Record<string, string> = {};
    if (!form.firstName) clientErrors.firstName = 'First name is required';
    if (!form.lastName) clientErrors.lastName = 'Last name is required';
    if (!form.username) clientErrors.username = 'Username is required';
    if (!form.email) clientErrors.email = 'Email is required';
    if (!form.departmentId) clientErrors.departmentId = 'Department is required';
    if (!form.jobTitleId) clientErrors.jobTitleId = 'Job title is required';
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }
    setFormErrors({});
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        gender: form.gender,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        dateOfJoining: form.dateOfJoining,
        employmentStatus: form.employmentStatus,
        salary: Number(form.salary || 0),
        departmentId: Number(form.departmentId),
        jobTitleId: Number(form.jobTitleId),
        supervisorId: form.supervisorId ? Number(form.supervisorId) : undefined,
        isActive: form.isActive,
        isManager: form.isManager,
        isRemoteWorker: form.isRemoteWorker,
        address: form.address,
      };

      await axios.post(`${API_ROOT}/employees`, payload);
      closeModal();
      await loadEmployees();
    } catch (error) {
      setErrorMessage("Unable to create employee.");
      console.error(error);
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      username: employee.username,
      email: employee.email,
      gender: employee.gender || "Female",
      phone: employee.phone || "",
      dateOfBirth: employee.dateOfBirth || "",
      dateOfJoining: employee.dateOfJoining || "",
      employmentStatus: employee.employmentStatus || "Permanent",
      salary: employee.salary ? String(employee.salary) : "",
      departmentId: employee.department?.departmentId ? String(employee.department.departmentId) : "1",
      jobTitleId: employee.jobTitle?.jobTitleId ? String(employee.jobTitle.jobTitleId) : "2",
      supervisorId: employee.supervisor?.employeeId ? String(employee.supervisor.employeeId) : "",
      isActive: employee.isActive ?? true,
      isManager: employee.isManager ?? false,
      isRemoteWorker: employee.isRemoteWorker ?? false,
      address: {
        addressLine1: employee.address?.addressLine1 || "",
        addressLine2: employee.address?.addressLine2 || "",
        city: employee.address?.city || "",
        state: employee.address?.state || "",
        country: employee.address?.country || "USA",
        zipcode: employee.address?.zipcode || "",
      },
    });
    setIsModalOpen(true);
  };

  const handleUpdateEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEmployee) return;

    // client-side validation
    const clientErrors: Record<string, string> = {};
    if (!form.firstName) clientErrors.firstName = 'First name is required';
    if (!form.lastName) clientErrors.lastName = 'Last name is required';
    if (!form.username) clientErrors.username = 'Username is required';
    if (!form.email) clientErrors.email = 'Email is required';
    if (!form.departmentId) clientErrors.departmentId = 'Department is required';
    if (!form.jobTitleId) clientErrors.jobTitleId = 'Job title is required';
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }
    setFormErrors({});

    try {
      const payload = {
        employeeCode: editingEmployee.employeeCode,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        gender: form.gender,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        dateOfJoining: form.dateOfJoining,
        employmentStatus: form.employmentStatus,
        salary: Number(form.salary || 0),
        departmentId: Number(form.departmentId),
        jobTitleId: Number(form.jobTitleId),
        supervisorId: form.supervisorId ? Number(form.supervisorId) : undefined,
        isActive: form.isActive,
        isManager: form.isManager,
        isRemoteWorker: form.isRemoteWorker,
        address: form.address,
      };

      await axios.put(`${API_ROOT}/employees/${editingEmployee.employeeId}`, payload);
      closeModal();
      await loadEmployees();
    } catch (error) {
      // Surface useful error details for debugging
      const detail = (error as any)?.response?.data?.message || (error as any)?.message || 'Unable to update employee';
      setErrorMessage(`Unable to update employee. ${detail}`);
      // show validation errors from server if present
      const srvErrors = (error as any)?.response?.data?.errors;
      if (Array.isArray(srvErrors)) {
        const mapped: Record<string, string> = {};
        srvErrors.forEach((e: string) => {
          // map basic messages like 'firstName is required' to field keys
          const m = e.match(/^(\w+) is required$/);
          if (m) mapped[m[1]] = `${m[1]} is required`;
        });
        setFormErrors(mapped);
      }
      console.error('Update employee error', (error as any)?.response?.data || error);
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    // open confirm modal
    setConfirmDeleteId(employeeId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await axios.delete(`${API_ROOT}/employees/${confirmDeleteId}`);
      setConfirmDeleteId(null);
      await loadEmployees();
    } catch (error) {
      setErrorMessage('Unable to delete employee.');
      console.error(error);
    }
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    document.title = "Employees — QA Automation Playground";
  }, []);

  return (
    <div className="compact-container">
      <h1>Employee Management</h1>
      <p className="intro">Employee Management for CRUD and UI automation practice.</p>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <div className="page-card compact spaced-panel">
        <div className="panel-row">
          <h2>Filter Employees</h2>
          <div className="btn-row">
            <button className="button button--primary" type="button" onClick={openCreateModal}>
              Create employee
            </button>
            <button className="button button--secondary" type="button" onClick={loadEmployees}>
              Load Employees
            </button>
          </div>
        </div>

        <div className="grid-form spaced-top">
          <label className="field-label">
            Name
            <input className="field-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by name" />
          </label>
          <label className="field-label">
            Department
            <select className="field-input" value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option value="">All</option>
              <option value="Engineering">Engineering</option>
              <option value="QA">QA</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </label>
          <label className="field-label">
            Status
            <select className="field-input" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All</option>
              <option value="Permanent">Permanent</option>
              <option value="Contract">Contract</option>
            </select>
          </label>
          <div className="align-end" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="button button--secondary" type="button" onClick={clearFilters}>
              Clear filters
            </button>
            <button className="button button--primary" type="button" onClick={() => loadEmployees()}>
              Apply filters
            </button>

          </div>
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            <table className="items-table spaced-top">
              <thead>
                <tr>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("employeeId")}>ID <span className="table-sort-indicator">{sortConfig.key === "employeeId" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("employeeCode")}>Emp Code <span className="table-sort-indicator">{sortConfig.key === "employeeCode" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("name")}>Name <span className="table-sort-indicator">{sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("username")}>Username <span className="table-sort-indicator">{sortConfig.key === "username" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("email")}>Email <span className="table-sort-indicator">{sortConfig.key === "email" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("status")}>Status <span className="table-sort-indicator">{sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("department")}>Department <span className="table-sort-indicator">{sortConfig.key === "department" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th><button className="table-sort-button" type="button" onClick={() => handleSort("jobTitle")}>Job Title <span className="table-sort-indicator">{sortConfig.key === "jobTitle" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}</span></button></th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {visibleEmployees.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.employeeCode}</td>
                    <td>{`${employee.firstName} ${employee.lastName}`}</td>
                    <td>{employee.username}</td>
                    <td>{employee.email}</td>
                    <td>{employee.employmentStatus || "-"}</td>
                    <td>{employee.department?.departmentName || "-"}</td>
                    <td>{employee.jobTitle?.jobTitleName || "-"}</td>
                    <td>
                      <button className="icon-button" type="button" onClick={() => openEditModal(employee)} title="Edit employee">
                        ✏️
                      </button>
                    </td>
                    <td>
                      <button className="icon-button" type="button" onClick={() => handleDeleteEmployee(employee.employeeId)} title="Delete employee">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {employees.length > 0 ? (
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
                  <span className="table-summary">Showing {Math.min((page - 1) * pageSize + 1, sortedEmployees.length)}-{Math.min(page * pageSize, sortedEmployees.length)} of {sortedEmployees.length}</span>
                </div>
                <div className="pagination-controls">
                  <button className="button button--secondary" type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button>
                  <span>Page {page} of {totalPages}</span>
                  <button className="button button--secondary" type="button" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {isModalOpen ? (
        <div className="modal-overlay">
          <div className="modal-card modal-compact">
            <div className="modal-row">
              <h3>{editingEmployee ? "Edit employee" : "Create employee"}</h3>
              <button className="button button--secondary" type="button" onClick={closeModal}>
                Close
              </button>
            </div>

            <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="modal-form-grid">
              {!editingEmployee ? null : (
                <label className="field-label">
                  Employee code
                  <input className="field-input" readOnly value={form.employeeCode} />
                </label>
              )}
              <label className="field-label small-label">
                <span className="field-label-title">First name <span className="required-asterisk">*</span></span>
                <input className="field-input small-input" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                {formErrors.firstName ? <div className="error-text">{formErrors.firstName}</div> : null}
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Last name <span className="required-asterisk">*</span></span>
                <input className="field-input small-input" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
                {formErrors.lastName ? <div className="error-text">{formErrors.lastName}</div> : null}
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Username <span className="required-asterisk">*</span></span>
                <input className="field-input small-input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
                {formErrors.username ? <div className="error-text">{formErrors.username}</div> : null}
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Email <span className="required-asterisk">*</span></span>
                <input className="field-input small-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                {formErrors.email ? <div className="error-text">{formErrors.email}</div> : null}
              </label>
              <label className="field-label small-label modal-grid-2">
                <span className="field-label-title">Gender</span>
                <div className="radio-row">
                  {['Female', 'Male', 'Other'].map((option) => (
                    <label key={option} className="radio-label">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={form.gender === option}
                        onChange={(event) => setForm({ ...form, gender: event.target.value })}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Phone</span>
                <input className="field-input small-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Date of birth</span>
                <input className="field-input small-input" type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Date of joining</span>
                <input className="field-input small-input" type="date" value={form.dateOfJoining} onChange={(event) => setForm({ ...form, dateOfJoining: event.target.value })} />
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Salary</span>
                <input className="field-input small-input" type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} />
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Department <span className="required-asterisk">*</span></span>
                <select className="field-input small-input" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
                  <option value="1">Engineering</option>
                  <option value="2">QA</option>
                  <option value="3">HR</option>
                  <option value="4">Finance</option>
                </select>
                {formErrors.departmentId ? <div className="error-text">{formErrors.departmentId}</div> : null}
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Job title <span className="required-asterisk">*</span></span>
                <select className="field-input small-input" value={form.jobTitleId} onChange={(event) => setForm({ ...form, jobTitleId: event.target.value })}>
                  <option value="1">Test Engineer</option>
                  <option value="2">Senior Test Engineer</option>
                  <option value="3">Automation Architect</option>
                  <option value="4">Software Developer</option>
                  <option value="5">HR Executive</option>
                </select>
                {formErrors.jobTitleId ? <div className="error-text">{formErrors.jobTitleId}</div> : null}
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Supervisor ID</span>
                <input className="field-input small-input" type="number" value={form.supervisorId} onChange={(event) => setForm({ ...form, supervisorId: event.target.value })} />
              </label>
              <label className="field-label small-label">
                <span className="field-label-title">Status</span>
                <select className="field-input small-input" value={form.employmentStatus} onChange={(event) => setForm({ ...form, employmentStatus: event.target.value })}>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                </select>
              </label>
              <label className="field-label inline-controls">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
                Active
              </label>
              <label className="field-label inline-controls">
                <input type="checkbox" checked={form.isRemoteWorker} onChange={(event) => setForm({ ...form, isRemoteWorker: event.target.checked })} />
                Remote worker
              </label>
              <div className="modal-grid-2">
                <label className="field-label small-label">
                  Address line 1
                  <input className="field-input small-input" value={form.address.addressLine1} onChange={(event) => setForm({ ...form, address: { ...form.address, addressLine1: event.target.value } })} />
                </label>
                <label className="field-label small-label">
                  Address line 2
                  <input className="field-input small-input" value={form.address.addressLine2} onChange={(event) => setForm({ ...form, address: { ...form.address, addressLine2: event.target.value } })} />
                </label>
                <label className="field-label small-label">
                  City
                  <input className="field-input small-input" value={form.address.city} onChange={(event) => setForm({ ...form, address: { ...form.address, city: event.target.value } })} />
                </label>
                <label className="field-label small-label">
                  State
                  <input className="field-input small-input" value={form.address.state} onChange={(event) => setForm({ ...form, address: { ...form.address, state: event.target.value } })} />
                </label>
                <label className="field-label small-label">
                  Country
                  <input className="field-input small-input" value={form.address.country} onChange={(event) => setForm({ ...form, address: { ...form.address, country: event.target.value } })} />
                </label>
                <label className="field-label small-label">
                  Zipcode
                  <input className="field-input small-input" value={form.address.zipcode} onChange={(event) => setForm({ ...form, address: { ...form.address, zipcode: event.target.value } })} />
                </label>
              </div>
              <div className="modal-actions">
                <button className="button button--secondary" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="button button--primary" type="submit">
                  {editingEmployee ? "Save changes" : "Create employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {confirmDeleteId ? (
        <div className="popup-modal">
          <div className="popup-card confirm-modal-card">
            <h3>Confirm delete</h3>
            <p className="confirm-message">Are you sure you want to delete this employee?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="button button--secondary" onClick={cancelDelete}>Cancel</button>
              <button className="button button--primary" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
