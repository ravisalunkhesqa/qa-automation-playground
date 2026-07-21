import { useEffect, useState } from "react";
import ShadowButton from "../components/ShadowButton";

export default function Widgets() {
  const [showDelayedButton, setShowDelayedButton] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [hoverText, setHoverText] = useState("Hover over the box");
  const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
  const [activeTab, setActiveTab] = useState("tab1");
  const [showPopover, setShowPopover] = useState(false);

  const tabItems = [
    { id: "tab1", label: "Tab 1", content: "Content for the first tab." },
    { id: "tab2", label: "Tab 2", content: "Content for the second tab." },
    { id: "tab3", label: "Tab 3", content: "Content for the third tab." },
  ];

  const activeTabContent = tabItems.find((tab) => tab.id === activeTab)?.content ?? tabItems[0].content;

  const loadDelayedElement = () => {
    setShowDelayedButton(false);
    setTimeout(() => {
      setShowDelayedButton(true);
    }, 5000);
  };

  const generatePopup = () => {
    const randomDelay = Math.floor(Math.random() * 10000) + 3000;
    setTimeout(() => {
      setShowPopup(true);
    }, randomDelay);
  };

  const loadMoreItems = () => {
    const nextItems = Array.from({ length: 10 }, (_, i) => `Item ${items.length + i + 1}`);
    setItems((prev) => [...prev, ...nextItems]);
  };

  const openNewTab = () => {
    window.open("https://example.com", "_blank", "noopener,noreferrer");
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", "drag-item");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropped(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    generatePopup();
  }, []);
  
  useEffect(() => {
    document.title = "Widgets — QA Automation Playground";
  }, []);

  return (
    <div className="page-card compact">
      <div className="stack">
        <h1>Interactive control playground</h1>
        <p className="intro">
          Fields for automation validation: inputs, buttons, drag/drop, and table interactions.
        </p>
      </div>

      <div className="widget-grid">
        <section className="panel">
          <h2>Form controls</h2>
          <div className="form-grid compact-form widget-form-grid">
            <label className="field-label">
              Textbox
              <input className="field-input" id="txtName" type="text" placeholder="Enter Name" />
            </label>
            <label className="field-label">
              Password
              <input className="field-input" id="txtPassword" type="password" placeholder="Enter Password" />
            </label>
            <label className="field-label field-inline">
              <span>Checkboxes</span>
              <div className="inline-controls">
                <label>
                  <input id="chkJava" type="checkbox" /> Java
                </label>
                <label>
                  <input id="chkPlaywright" type="checkbox" /> Playwright
                </label>
              </div>
            </label>
            <label className="field-label field-inline">
              <span>Radio buttons</span>
              <div className="inline-controls">
                <label>
                  <input type="radio" name="browser" value="chrome" /> Chrome
                </label>
                <label>
                  <input type="radio" name="browser" value="firefox" /> Firefox
                </label>
              </div>
            </label>
            <label className="field-label">
              Dropdown
              <select className="field-input" id="country">
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Japan</option>
              </select>
            </label>
            <label className="field-label">
              Multi select
              <select className="field-input" id="multiCountry" multiple size={4}>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Australia</option>
              </select>
            </label>
            <label className="field-label">
              Date picker
              <input className="field-input" id="datePicker" type="date" />
            </label>
            <label className="field-label">
              Autocomplete
              <input className="field-input" id="autocomplete" list="cities" placeholder="Type a city" />
              <datalist id="cities">
                <option value="Pune" />
                <option value="Mumbai" />
                <option value="Bangalore" />
                <option value="Delhi" />
                <option value="Chennai" />
              </datalist>
            </label>
          </div>
        </section>

        <section className="panel">
          <h2>Interaction controls</h2>
          <div className="button-row compact-button-row">
            <button className="button button--secondary" onClick={() => alert("Simple Alert")}>Alert</button>
            <button className="button button--secondary" onClick={() => confirm("Confirm Action")}>Confirm</button>
            <button className="button button--secondary" onClick={() => prompt("Enter Name")}>Prompt</button>
          </div>
          <div className="button-row compact-button-row">
            <button className="button button--secondary" id={`btn-${Math.floor(Math.random() * 100000)}`}>Dynamic Button</button>
          </div>
          <div className="button-row compact-button-row">
            <button className="button button--secondary" onClick={loadDelayedElement}>Load After 5 Seconds</button>
            {showDelayedButton && <button className="button button--secondary" id="delayed-btn">Delayed Button</button>}
          </div>
          <div className="widget-action-group">
            <h3>Interactive clicks</h3>
            <div className="button-row compact-button-row">
              <button className="button button--secondary" onContextMenu={(e) => { e.preventDefault(); alert("Right Click Performed"); }}>Right Click Here</button>
              <button className="button button--secondary" onDoubleClick={() => alert("Double Click Success")}>Double Click Me</button>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Drag & drop</h2>
          <div className="drag-area" draggable onDragStart={handleDragStart}>Drag Me</div>
          <div className="drop-area" onDrop={handleDrop} onDragOver={handleDragOver}>
            {dropped ? "Dropped Successfully" : "Drop Here"}
          </div>
        </section>

        <section className="panel">
          <h2>Mouse Hover</h2>
          <div className="hover-box" onMouseEnter={() => setHoverText("Mouse Hovered")} onMouseLeave={() => setHoverText("Hover over the box")}>{hoverText}</div>
          <div className="widget-inline-section">
            <h3>Slider</h3>
            <input className="field-input" id="slider" type="range" min="0" max="100" />
          </div>
          <div className="widget-inline-section">
            <h3>File upload</h3>
            <input className="field-input" id="fileUpload" type="file" />
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Dynamic content</h2>
        <div className="widget-inline-section">
          <h3>Tabs / accordion</h3>
          <div className="widget-tabs">
            <div className="widget-tab-list" role="tablist" aria-label="Demo tabs">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  className={`widget-tab ${activeTab === tab.id ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="widget-tab-panel">
              <p>{activeTabContent}</p>
            </div>
          </div>
        </div>
        <div className="widget-inline-section">
          <h3>Tooltip / popover</h3>
          <button
            className="button button--secondary"
            type="button"
            title="Helpful tooltip"
            onMouseEnter={() => setShowPopover(true)}
            onMouseLeave={() => setShowPopover(false)}
            onFocus={() => setShowPopover(true)}
            onBlur={() => setShowPopover(false)}
            onClick={() => setShowPopover((prev) => !prev)}
          >
            Hover or click me
          </button>
          <div className={`widget-popover ${showPopover ? "visible" : ""}`}>Popover content</div>
        </div>
      </section>

      <section className="panel">
        <h2>Advanced browser/DOM scenarios</h2>
        <div className="widget-inline-section">
          <h3>New window / tab</h3>
          <button className="button button--secondary" type="button" onClick={openNewTab}>Open New Tab</button>
          <p className="intro">Opens a new browser tab for window-handling automation checks.</p>
        </div>
        <div className="widget-inline-section">
          <h3>Iframe</h3>
          <iframe title="Widget iframe" src="/iframe.html" className="widget-iframe" />
        </div>
        <div className="widget-inline-section">
          <h3>Web table</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Rahul</td><td>9876543210</td><td>Pune</td></tr>
              <tr><td>John</td><td>9988776655</td><td>Mumbai</td></tr>
              <tr><td>David</td><td>8899776655</td><td>Bangalore</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Shadow DOM challenge</h2>
        <p>Locate and click the button inside Shadow DOM.</p>
        <ShadowButton />
      </section>

      <section className="panel">
        <h2>Infinite scroll</h2>
        <div className="scroll-box compact-scroll-box">
          {items.map((item) => (
            <div key={item} className="scroll-item">{item}</div>
          ))}
          <button className="button button--primary" onClick={loadMoreItems}>Load More</button>
        </div>
      </section>

      {showPopup && (
        <div className="popup-modal">
          <div className="popup-card">
            <h3>Special Offer</h3>
            <button className="button button--primary" onClick={() => setShowPopup(false)}>Close Popup</button>
          </div>
        </div>
      )}


    </div>
  );
}
