import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "Home — QA Automation Playground";
  }, []);

  return (
    <div className="page-card page-card--hero">
      <div className="page-hero">
        <section className="home-hero-copy">
          <h1>QA Automation Playground</h1>
          <p className="intro">
            A modern training hub for QA automation engineers to practice UI, API, and database automation with real-world test scenarios.
          </p>

          <div className="home-highlights">
            <span>Realistic automation scenarios</span>
            <span>Clean CRUD apps</span>
            <span>API + SQL validation</span>
            <span>Modern React frontend</span>
          </div>

          <div className="home-content">
            <h2>Key Features</h2>
            <ul className="feature-list">
              <li>UI Automation Playground with rich web elements, forms, tables, alerts, drag-and-drop, file upload/download, waits, and Shadow DOM.</li>
              <li>API Playground with CRUD REST APIs for automation testing using Postman, REST Assured, and Playwright.</li>
              <li>SQL Playground for practicing database validation and SQL queries against a realistic data model.</li>
              <li>Employee Management module supporting complete CRUD operations with search, filters, and editable details.</li>
              <li>Dynamic data tables built for filtering, sorting, pagination, and automation validation.</li>
              <li>End-to-end test scenarios covering UI, API, and database verification paths.</li>
              <li>Designed for seamless automation practice with Selenium, Playwright, Cypress, REST Assured, and other tools.</li>
            </ul>
          </div>
        </section>

        <aside className="panel home-panel">
          <h2>Technology Stack</h2>
          <ul className="stack-list">
            <li><strong>Frontend:</strong> React, TypeScript, Vite</li>
            <li><strong>Backend:</strong> Node.js, Express.js</li>
            <li><strong>Database:</strong> PostgreSQL / Supabase</li>
            <li><strong>APIs:</strong> RESTful Services</li>
          </ul>

          <div className="panel-note">
            Built to help automation engineers learn, validate, and execute robust test coverage across browser, API, and data layers.
          </div>
        </aside>
      </div>
    </div>
  );
}
