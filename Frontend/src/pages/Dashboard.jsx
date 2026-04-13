import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import ATSScoreRing from "../components/resume/ATSScoreRing";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const STATUS_COLOR = {
  draft: "var(--text-muted)",
  analyzed: "#fbbf24",
  rewritten: "var(--primary)",
  exported: "var(--accent)",
};

const STATUS_ICON = {
  draft: "📝",
  analyzed: "🔍",
  rewritten: "✨",
  exported: "📤",
};

export default function Dashboard() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Handle Stripe success redirect
  useEffect(() => {
    if (searchParams.get("upgrade") === "success") {
      toast.success("🎉 You're now on Pro! Unlimited resumes unlocked.");
      refreshUser();
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/resume");
        setResumes(data);
      } catch {
        toast.error("Failed to load resumes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume permanently?")) return;
    setDeleting(id);
    try {
      await api.delete(`/resume/${id}`);
      setResumes((r) => r.filter((x) => x._id !== id));
      toast.success("Resume deleted.");
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleting(null);
    }
  };

  const handleNew = async () => {
    try {
      const { data } = await api.post("/resume", { title: "Untitled Resume" });
      navigate(`/builder/${data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || "Error";
      if (err.response?.data?.upgradeRequired) {
        toast.error("Free plan allows 1 resume. Upgrade to Pro!");
        navigate("/pricing");
      } else {
        toast.error(msg);
      }
    }
  };

  const isPro = user?.plan === "pro";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 0 80px" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "2rem", marginBottom: 6 }}>
              Hey, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
              {isPro ? "Pro plan · Unlimited resumes" : `Free plan · ${resumes.length}/1 resumes used`}
            </p>
          </div>
          <button id="new-resume-btn" className="btn-primary" onClick={handleNew} style={{ padding: "12px 24px", fontSize: "0.95rem" }}>
            + New Resume
          </button>
        </div>

        {/* Plan banner for free users */}
        {!isPro && (
          <div className="glass animate-fade-in" style={{
            padding: "20px 24px", borderRadius: "var(--radius-lg)",
            marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16, flexWrap: "wrap",
            background: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,170,0.08))",
            border: "1px solid rgba(108,99,255,0.25)",
          }}>
            <div>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>⚡ Unlock Pro Features</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Unlimited resumes · Modern & Minimal templates · Priority AI
              </p>
            </div>
            <Link to="/pricing">
              <button className="btn-accent" style={{ padding: "10px 22px" }}>Upgrade to Pro →</button>
            </Link>
          </div>
        )}

        {/* Resumes grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <LoadingSpinner label="Loading your resumes…" />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {resumes.map((r, i) => (
              <ResumeCard
                key={r._id}
                resume={r}
                delay={i * 0.07}
                onOpen={() => navigate(`/builder/${r._id}`)}
                onDelete={() => handleDelete(r._id)}
                isDeleting={deleting === r._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeCard({ resume, delay, onOpen, onDelete, isDeleting }) {
  return (
    <div
      className="card animate-fade-in-up"
      style={{ padding: 24, cursor: "pointer", animationDelay: `${delay}s`, opacity: 0 }}
      onClick={onOpen}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {resume.title}
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {new Date(resume.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <ATSScoreRing score={resume.atsScore || 0} size={60} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color: STATUS_COLOR[resume.status] || "var(--text-muted)", fontSize: "0.9rem" }}>
          {STATUS_ICON[resume.status]}
        </span>
        <span style={{ fontSize: "0.8rem", color: STATUS_COLOR[resume.status] || "var(--text-muted)", fontWeight: 600, textTransform: "capitalize" }}>
          {resume.status}
        </span>
        <span style={{ color: "var(--border)", margin: "0 4px" }}>·</span>
        <span className={`badge badge-${resume.template === "classic" ? "primary" : "accent"}`} style={{ fontSize: "0.7rem" }}>
          {resume.template}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
        <button className="btn-ghost" onClick={onOpen} style={{ flex: 1, justifyContent: "center", padding: "7px", fontSize: "0.82rem" }}>
          Open
        </button>
        <button
          className="btn-ghost"
          onClick={onDelete}
          disabled={isDeleting}
          style={{ padding: "7px 12px", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", fontSize: "0.82rem" }}
        >
          {isDeleting ? "…" : "🗑"}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }} className="animate-float">📄</div>
      <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>No resumes yet</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: "0.92rem", maxWidth: 360, margin: "0 auto 28px" }}>
        Create your first AI-powered resume and land interviews faster.
      </p>
      <button className="btn-primary" onClick={onCreate} style={{ padding: "12px 28px", fontSize: "0.95rem" }}>
        ✨ Create My First Resume
      </button>
    </div>
  );
}
