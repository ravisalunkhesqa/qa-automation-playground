CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  department_code VARCHAR(20) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (department_name, department_code)
VALUES
  ('Engineering', 'ENG'),
  ('QA', 'QA'),
  ('HR', 'HR'),
  ('Finance', 'FIN')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS job_titles (
  job_title_id SERIAL PRIMARY KEY,
  job_title_name VARCHAR(100) NOT NULL,
  description TEXT
);

INSERT INTO job_titles (job_title_name, description)
VALUES
  ('Test Engineer', 'Entry-level QA role'),
  ('Senior Test Engineer', 'Experienced QA professional'),
  ('Automation Architect', 'Automation strategy and framework design'),
  ('Software Developer', 'Application development'),
  ('HR Executive', 'People operations role')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS employees (
  employee_id SERIAL PRIMARY KEY,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(30),
  date_of_birth DATE,
  date_of_joining DATE,
  employment_status VARCHAR(50),
  supervisor_id INTEGER,
  department_id INTEGER,
  job_title_id INTEGER,
  salary DECIMAL(12,2),
  is_active BOOLEAN DEFAULT TRUE,
  is_manager BOOLEAN DEFAULT FALSE,
  is_remote_worker BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(department_id),
  CONSTRAINT fk_job_title FOREIGN KEY (job_title_id) REFERENCES job_titles(job_title_id),
  CONSTRAINT fk_supervisor FOREIGN KEY (supervisor_id) REFERENCES employees(employee_id)
);

CREATE TABLE IF NOT EXISTS employee_addresses (
  address_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  zipcode VARCHAR(20),
  CONSTRAINT fk_employee_address FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_documents (
  document_id SERIAL PRIMARY KEY,
  employee_id INTEGER,
  document_name VARCHAR(200),
  document_type VARCHAR(100),
  file_path TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_document FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
