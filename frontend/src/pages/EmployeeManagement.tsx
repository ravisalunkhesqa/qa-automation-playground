import { useEffect, useState } from "react";
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

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("department", searchTerm.trim());
      if (department) params.set("department", department);
      if (status) params.set("status", status);
      const query = params.toString();
      const result = await axios.get(`${API_ROOT}/employees${query ? `?${query}` : ""}`);
      setEmployees(result.data?.items || []);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Unable to load employees.");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      setErrorMessage("Unable to update employee.");
      console.error(error);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    document.title = "Employees — QA Automation Playground";
  }, []);

  return (
    <div className="compact-container">
      <h1>Employee Management</h1>
      <p className="intro">HRMS-style employee list for CRUD and UI automation practice.</p>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <div className="page-card compact spaced-panel">
        <div className="panel-row">
          <h2>Employees</h2>
          <div className="btn-row">
            <button className="button button--primary" type="button" onClick={openCreateModal}>
              Create employee
            </button>
            <button className="button button--secondary" type="button" onClick={loadEmployees}>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid-form spaced-top">
          <label className="field-label">
            Search name
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
          <div className="align-end">
            <button className="button button--primary" type="button" onClick={() => loadEmployees()}>
              Apply filters
            </button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : (
          <table className="items-table spaced-top">
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Department</th>
                <th>Job Title</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
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
                    <button className="button button--secondary" type="button" onClick={() => openEditModal(employee)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen ? (
        <div className="modal-overlay">
          <div className="modal-card">
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
                First name
                <input className="field-input small-input" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Last name
                <input className="field-input small-input" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Username
                <input className="field-input small-input" required value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Email
                <input className="field-input small-input" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="field-label small-label modal-grid-2">
                Gender
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
                Phone
                <input className="field-input small-input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Date of birth
                <input className="field-input small-input" type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Date of joining
                <input className="field-input small-input" type="date" value={form.dateOfJoining} onChange={(event) => setForm({ ...form, dateOfJoining: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Salary
                <input className="field-input small-input" type="number" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Department
                <select className="field-input small-input" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
                  <option value="1">Engineering</option>
                  <option value="2">QA</option>
                  <option value="3">HR</option>
                  <option value="4">Finance</option>
                </select>
              </label>
              <label className="field-label small-label">
                Job title
                <select className="field-input small-input" value={form.jobTitleId} onChange={(event) => setForm({ ...form, jobTitleId: event.target.value })}>
                  <option value="1">Test Engineer</option>
                  <option value="2">Senior Test Engineer</option>
                  <option value="3">Automation Architect</option>
                  <option value="4">Software Developer</option>
                  <option value="5">HR Executive</option>
                </select>
              </label>
              <label className="field-label small-label">
                Supervisor ID
                <input className="field-input small-input" type="number" value={form.supervisorId} onChange={(event) => setForm({ ...form, supervisorId: event.target.value })} />
              </label>
              <label className="field-label small-label">
                Status
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
    </div>
  );
}
