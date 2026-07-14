import { useEffect, useRef } from "react";

export default function ShadowButton() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostRef.current || hostRef.current.shadowRoot) return;

    const shadowRoot = hostRef.current.attachShadow({
      mode: "open",
    });

    shadowRoot.innerHTML = `
      <style>
        button {
          background-color: #1976d2;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
        }

        button:hover {
          background-color: #1565c0;
        }
      </style>

      <button id="shadow-submit-btn">
        Submit From Shadow DOM
      </button>
    `;

    const button = shadowRoot.querySelector("#shadow-submit-btn");
    const handleClick = () => {
      alert("Shadow DOM Button Clicked");
    };

    button?.addEventListener("click", handleClick);

    return () => {
      button?.removeEventListener("click", handleClick);
    };
  }, []);

  return <div id="shadow-host" ref={hostRef}></div>;
}