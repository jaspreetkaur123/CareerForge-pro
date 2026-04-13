import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const { register: signup, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    const res = await signup(form.name, form.email, form.password);
    if (res.success) {
      toast.success("Account created! Let's build your resume 🚀");
      navigate("/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthColor = ["transparent", "#ef4444", "#fbbf24", "var(--accent)"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      background: "radial-gradient(ellipse at 40% 80%, rgba(0,212,170,0.1) 0%, transparent 60%), var(--bg)",
    }}>
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 16px",
          }}>C</div>
          <h1 style={{ fontSize: "1.7rem", marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Start building ATS-proof resumes for free
          </p>
        </div>

        {/* Perks */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {["✅ Free to start", "🤖 AI-powered rewrite", "📄 PDF export"].map((p) => (
            <span key={p} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", background: "var(--surface-2)", padding: "4px 10px", borderRadius: 100, border: "1px solid var(--border)" }}>
              {p}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                id="register-name"
                name="name"
                type="text"
                className="input"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handle}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                id="register-email"
                name="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span>Password</span>
                {strengthLabel && (
                  <span style={{ color: strengthColor, fontWeight: 600, fontSize: "0.75rem" }}>
                    {strengthLabel}
                  </span>
                )}
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                className="input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handle}
                required
                autoComplete="new-password"
              />
              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                  {[1, 2, 3].map((n) => (
                    <div key={n} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: n <= strength ? strengthColor : "var(--surface-2)",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}
            >
              {isLoading ? (
                <>
                  <span style={spinStyle} />
                  Creating account…
                </>
              ) : "Create Free Account →"}
            </button>

            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
};

const spinStyle = {
  display: "inline-block",
  width: 14, height: 14,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  animation: "spin 0.75s linear infinite",
};
