export default function KeywordBadges({ analysis }) {
  if (!analysis) return null;

  const { keywords = [], mustHave = [], niceToHave = [], tone, jobTitle } = analysis;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {jobTitle && (
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
            🎯 {jobTitle}
          </h3>
        )}
        {tone && (
          <span className="badge badge-primary">
            {tone === "technical" ? "⚙️" : tone === "leadership" ? "🏆" : "🎨"} {tone}
          </span>
        )}
      </div>

      {/* Must Have */}
      {mustHave.length > 0 && (
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444", marginBottom: 8 }}>
            🔴 Must Have
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {mustHave.map((kw) => (
              <span key={kw} className="badge badge-danger">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--primary)", marginBottom: 8 }}>
            🔑 Keywords
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {keywords.map((kw) => (
              <span key={kw} className="badge badge-primary">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Nice to Have */}
      {niceToHave.length > 0 && (
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fbbf24", marginBottom: 8 }}>
            ⭐ Nice to Have
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {niceToHave.map((kw) => (
              <span key={kw} className="badge badge-warn">{kw}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
