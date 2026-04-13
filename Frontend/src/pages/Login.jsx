import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      background: "radial-gradient(ellipse at 60% 20%, rgba(108,99,255,0.12) 0%, transparent 60%), var(--bg)",
    }}>
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 16px",
          }}>C</div>
          <h1 style={{ fontSize: "1.7rem", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Sign in to CareerForge Pro
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                id="login-email"
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
              <label style={labelStyle}>Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}
            >
              {isLoading ? (
                <>
                  <span style={spinStyle} />
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Sign up free
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
  marginBottom: 7,
};

const spinStyle = {
  display: "inline-block",
  width: 14, height: 14,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.3)",
  borderTopColor: "#fff",
  animation: "spin 0.75s linear infinite",
};
