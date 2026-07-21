import { useEffect } from "react";

const repositories = [
  {
    title: "Playwright Framework",
    description: "End-to-end automation with modern browser testing, fixtures, and CI-ready execution.",
    tags: ["Playwright", "E2E", "TypeScript"],
  },
  {
    title: "Selenium Java Suite",
    description: "Cross-browser automation using Selenium WebDriver with Page Object Model patterns.",
    tags: ["Selenium", "Java", "Page Objects"],
  },
  {
    title: "Cypress Automation",
    description: "Fast and reliable UI testing for modern web apps with component and E2E coverage.",
    tags: ["Cypress", "UI", "JavaScript"],
  },
  {
    title: "REST Assured API Suite",
    description: "API validation repository for contract, regression, and smoke testing workflows.",
    tags: ["REST Assured", "API", "Java"],
  },
  {
    title: "Appium Mobile Tests",
    description: "Mobile automation placeholders for Android and iOS scenarios with device-level validation.",
    tags: ["Appium", "Mobile", "Automation"],
  },
  {
    title: "TestNG + Maven",
    description: "Structured test automation repository with test grouping, reports, and build integration.",
    tags: ["TestNG", "Maven", "Reports"],
  },
];

export default function Repository() {
  useEffect(() => {
    document.title = "Repository — QA Automation Playground";
  }, []);

  return (
    <div className="page-card compact">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Repository</p>
          <h1>Automation Framework Repositories</h1>
          <p className="intro">
             Collection of test automation repositories covering various frameworks and tech stacks.
          </p>
        </div>
      </div>

      <div className="repo-grid">
        {repositories.map((repo) => (
          <article key={repo.title} className="repo-card">
            <div className="repo-card__top">
              <h2>{repo.title}</h2>
              <span className="repo-badge">Coming soon</span>
            </div>
            <p>{repo.description}</p>
            <div className="repo-tags">
              {repo.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
