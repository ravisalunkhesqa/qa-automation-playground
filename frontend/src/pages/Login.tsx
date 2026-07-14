import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const blockedDomains = [
  "test.com",
  "example.com",
  "example.org",
  "example.net",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const domain = normalizedEmail.split("@")[1];
    if (blockedDomains.includes(domain)) {
      setMessage("Please use a real email address. Some auth providers may reject test/example domains.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setMessage("Backend client is not configured.");
      setLoading(false);
      return;
    }

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Signed in successfully.");
        navigate("/users");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email: normalizedEmail, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm your account.");
        navigate("/users");
      }
    }

    setLoading(false);
  };

  return (
    <div className="page-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <p className="eyebrow">Account access</p>
      <h1>{mode === "sign-in" ? "Sign in" : "Create account"}</h1>
      <p className="intro">Securely sign in or create an account.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="button" className="link-button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? "Processing..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>

      {message ? <p className="message">{message}</p> : null}

      <div className="auth-footer">
        <p>
          {mode === "sign-in" ? "Need an account?" : "Already have an account?"}
          <button type="button" className="link-button" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}> 
            {mode === "sign-in" ? "Sign up" : "Sign in"}
          </button>
        </p>
        <p className="fine-print">Use a real email such as yourname@gmail.com or user@outlook.com.</p>
      </div>
    </div>
  );
}
