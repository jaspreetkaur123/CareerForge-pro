import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(10,10,15,0.85)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
          }}>C</div>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
            Career<span className="gradient-text">Forge</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!user ? (
            <>
              <Link to="/#features" style={{ color: "var(--text-secondary)", padding: "6px 14px", fontSize: "0.88rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>
                Features
              </Link>
              <Link to="/pricing" style={{ color: "var(--text-secondary)", padding: "6px 14px", fontSize: "0.88rem", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>
                Pricing
              </Link>
              <Link to="/login"><button className="btn-ghost" style={{ padding: "7px 18px", fontSize: "0.88rem" }}>Sign In</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: "7px 18px", fontSize: "0.88rem" }}>Get Started</button></Link>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
              <NavLink to="/builder" label="New Resume" active={isActive("/builder")} />
              {user.plan === "free" && (
                <Link to="/pricing">
                  <span className="badge badge-warn" style={{ cursor: "pointer" }}>⚡ Upgrade</span>
                </Link>
              )}
              {user.plan === "pro" && <span className="badge badge-accent">Pro</span>}
              <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{user.name?.split(" ")[0]}</span>
              </div>
              <button className="btn-ghost" onClick={handleLogout} style={{ padding: "7px 14px", fontSize: "0.85rem" }}>
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to}>
      <button style={{
        background: active ? "rgba(108,99,255,0.12)" : "transparent",
        color: active ? "var(--primary)" : "var(--text-secondary)",
        border: active ? "1px solid rgba(108,99,255,0.25)" : "1px solid transparent",
        borderRadius: "var(--radius)",
        padding: "7px 14px", fontSize: "0.88rem", fontWeight: active ? 600 : 400,
        cursor: "pointer", transition: "all 0.2s",
      }}>
        {label}
      </button>
    </Link>
  );
}
