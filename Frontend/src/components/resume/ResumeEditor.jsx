import { useState } from "react";

export default function ResumeEditor({ data, onChange }) {
  const [activeSection, setActiveSection] = useState("summary");

  if (!data) return null;

  const update = (field, value) => onChange({ ...data, [field]: value });
  const updateExp = (i, field, value) => {
    const exp = [...(data.experience || [])];
    exp[i] = { ...exp[i], [field]: value };
    onChange({ ...data, experience: exp });
  };
  const updateBullet = (expIdx, bulletIdx, value) => {
    const exp = [...(data.experience || [])];
    const bullets = [...(exp[expIdx].bullets || [])];
    bullets[bulletIdx] = value;
    exp[expIdx] = { ...exp[expIdx], bullets };
    onChange({ ...data, experience: exp });
  };
  const updateEdu = (i, field, value) => {
    const edu = [...(data.education || [])];
    edu[i] = { ...edu[i], [field]: value };
    onChange({ ...data, education: edu });
  };

  const sections = [
    { id: "summary", label: "📝 Summary" },
    { id: "experience", label: "💼 Experience" },
    { id: "skills", label: "🛠 Skills" },
    { id: "education", label: "🎓 Education" },
    { id: "contact", label: "👤 Contact" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Section tabs */}
      <div style={{
        display: "flex", gap: 4, overflowX: "auto", paddingBottom: 2,
        borderBottom: "1px solid var(--border)", marginBottom: 20,
      }}>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: "7px 14px", borderRadius: "var(--radius) var(--radius) 0 0",
              border: "none", background: activeSection === s.id ? "rgba(108,99,255,0.12)" : "transparent",
              color: activeSection === s.id ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: activeSection === s.id ? 600 : 400,
              fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: activeSection === s.id ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Summary ── */}
      {activeSection === "summary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Professional Summary</label>
          <textarea
            className="input textarea"
            value={data.summary || ""}
            onChange={(e) => update("summary", e.target.value)}
            rows={6}
            style={{ fontSize: "0.85rem", lineHeight: 1.7 }}
          />
        </div>
      )}

      {/* ── Experience ── */}
      {activeSection === "experience" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {(data.experience || []).map((exp, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Job Title</label>
                  <input className="input" value={exp.title || ""} onChange={(e) => updateExp(i, "title", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Company</label>
                  <input className="input" value={exp.company || ""} onChange={(e) => updateExp(i, "company", e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Start</label>
                  <input className="input" value={exp.startDate || ""} onChange={(e) => updateExp(i, "startDate", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>End</label>
                  <input className="input" value={exp.endDate || ""} onChange={(e) => updateExp(i, "endDate", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bullet Points</label>
                {(exp.bullets || []).map((b, bi) => (
                  <textarea
                    key={bi}
                    className="input"
                    value={b}
                    onChange={(e) => updateBullet(i, bi, e.target.value)}
                    rows={2}
                    style={{ marginBottom: 6, fontSize: "0.83rem" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ── */}
      {activeSection === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={labelStyle}>Skills (comma separated)</label>
          <textarea
            className="input textarea"
            value={(data.skills || []).join(", ")}
            onChange={(e) => update("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            rows={4}
            style={{ fontSize: "0.85rem" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {(data.skills || []).map((s, i) => (
              <span key={i} className="badge badge-primary">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ── */}
      {activeSection === "education" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(data.education || []).map((edu, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, background: "var(--surface-2)", borderRadius: "var(--radius)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Degree</label>
                  <input className="input" value={edu.degree || ""} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Field</label>
                  <input className="input" value={edu.field || ""} onChange={(e) => updateEdu(i, "field", e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Institution</label>
                <input className="input" value={edu.institution || ""} onChange={(e) => updateEdu(i, "institution", e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Start</label>
                  <input className="input" value={edu.startDate || ""} onChange={(e) => updateEdu(i, "startDate", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>End</label>
                  <input className="input" value={edu.endDate || ""} onChange={(e) => updateEdu(i, "endDate", e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>GPA</label>
                  <input className="input" value={edu.gpa || ""} onChange={(e) => updateEdu(i, "gpa", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Contact ── */}
      {activeSection === "contact" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "name", label: "Full Name", placeholder: "Jane Smith" },
            { key: "email", label: "Email", placeholder: "jane@example.com" },
            { key: "phone", label: "Phone", placeholder: "+1 555 000 0000" },
            { key: "location", label: "Location", placeholder: "San Francisco, CA" },
            { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/janesmith" },
            { key: "github", label: "GitHub", placeholder: "github.com/janesmith" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                className="input"
                placeholder={placeholder}
                value={data[key] || ""}
                onChange={(e) => update(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
};
