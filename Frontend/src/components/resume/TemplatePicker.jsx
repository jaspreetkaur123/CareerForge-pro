const TEMPLATES = [
  {
    id: "classic",
    label: "Classic",
    desc: "Traditional single-column, serif typography",
    icon: "📄",
    preview: {
      bg: "#fff",
      accent: "#1a1a1a",
      bar: "#1a1a1a",
    },
    free: true,
  },
  {
    id: "modern",
    label: "Modern",
    desc: "Two-column with violet accent sidebar",
    icon: "✨",
    preview: {
      bg: "#6C63FF",
      accent: "#fff",
      bar: "#fff",
    },
    free: false,
  },
  {
    id: "minimal",
    label: "Minimal",
    desc: "Clean whitespace, monochrome design",
    icon: "⬜",
    preview: {
      bg: "#f9f9f9",
      accent: "#222",
      bar: "#ddd",
    },
    free: false,
  },
];

export default function TemplatePicker({ selected, onSelect, isPro }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        Choose a PDF template
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {TEMPLATES.map((t) => {
          const locked = !t.free && !isPro;
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              id={`template-${t.id}`}
              onClick={() => !locked && onSelect(t.id)}
              title={locked ? "Upgrade to Pro to unlock" : t.label}
              style={{
                background: isSelected ? "rgba(108,99,255,0.1)" : "var(--surface-2)",
                border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                padding: "14px 10px",
                cursor: locked ? "not-allowed" : "pointer",
                textAlign: "center",
                transition: "all 0.22s",
                opacity: locked ? 0.55 : 1,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}
            >
              {/* Mini preview swatch */}
              <div style={{
                width: 48, height: 60, borderRadius: 4,
                background: t.preview.bg,
                border: "1px solid rgba(0,0,0,0.12)",
                display: "flex", flexDirection: "column",
                padding: "6px 5px", gap: 3,
                overflow: "hidden",
              }}>
                {[1,0.6,0.4,0.6,0.4].map((w, i) => (
                  <div key={i} style={{
                    height: i === 0 ? 5 : 3,
                    width: `${w * 100}%`,
                    background: t.preview.bar,
                    borderRadius: 2, opacity: i === 0 ? 1 : 0.4,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: isSelected ? "var(--primary)" : "var(--text-primary)" }}>
                {locked ? "🔒 " : ""}{t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
